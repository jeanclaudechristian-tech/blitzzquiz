<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Auth\EmailVerificationRequest;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users',
            'username' => 'nullable|string|max:50',
            'nickname' => 'nullable|string|max:50',
            'password' => 'required|min:8|confirmed',
            'role' => 'required|in:TEACHER,STUDENT',
            'education_level' => 'nullable|string|max:100',
        ]);

        $usernameValue = $request->username ?? $request->nickname;

        if (!$usernameValue) {
            return response()->json([
                'errors' => ['username' => ['The username field is required.']]
            ], 422);
        }

        $user = User::create([
            'email' => $request->email,
            'nickname' => $usernameValue,
            'password' => Hash::make($request->password),
            'role' => $request->input('role', 'STUDENT'),
            'education_level' => $request->education_level,
        ]);

        event(new Registered($user));

        return response()->json([
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credentials incorrects.'],
            ]);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Votre adresse email n\'est pas encore vérifiée.',
                'needs_verification' => true
            ], 403); // 使用 403 Forbidden [cite: 1, 2026-03-15]
        }

        $token = $user->createToken('quiz-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }


    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function googleRedirect()
    {
        $redirectUrl = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();
        return response()->json(['redirect_url' => $redirectUrl]);
    }

   public function googleCallback(Request $request)
   {
       $idToken = $request->input('access_token'); // 对应 AuthCallback.vue 传来的字段

       try {
           // 使用 Google 官方验证端点
           $response = \Illuminate\Support\Facades\Http::withoutVerifying()
               ->get("https://oauth2.googleapis.com/tokeninfo?id_token={$idToken}");

           if ($response->failed()) {
                      // 这里非常关键：把 Google 返回的原始错误吐给前端
                      return response()->json([
                          'error' => 'Google validation failed',
                          'google_error' => $response->json()
                      ], 401);
                  }

           $googleData = $response->json();

           // 关键：检查 Client ID 是否匹配，防止跨站攻击
           if ($googleData['aud'] !== env('GOOGLE_CLIENT_ID')) {
                return response()->json(['error' => 'Client ID Mismatch'], 401);
           }

           $email = $googleData['email'];
           $googleId = $googleData['sub'];

           // 后续查找或创建用户的逻辑...
           $user = User::where('google_id', $googleId)->orWhere('email', $email)->first();

           if (!$user) {
               return response()->json([
                   'needs_completion' => true,
                   'user' => [
                       'email' => $email,
                       'google_id' => $googleId,
                       'avatar' => $googleData['picture'] ?? null
                   ]
               ]);
           }

           $token = $user->createToken('auth_token')->plainTextToken;
           return response()->json(['token' => $token, 'user' => $user, 'needs_completion' => false]);

       } catch (\Exception $e) {
           return response()->json(['error' => $e->getMessage()], 500);
       }
   }

   public function registerGoogleFinal(Request $request)
   {
       $request->validate([
           'email' => 'required|email|unique:users',
           'username' => 'required|string|max:50',
           'google_id' => 'required|string',
           'avatar' => 'nullable|string',
           'role' => 'required|in:TEACHER,STUDENT',
           'education_level' => 'nullable|string',
       ]);

       // 创建用户，Google 用户不需要密码，或者给一个随机密码
       $user = User::create([
           'email' => $request->email,
           'nickname' => $request->username,
           'google_id' => $request->google_id,
           'avatar' => $request->avatar,
           'password' => Hash::make(Str::random(24)), // 随机密码
           'role' => $request->role,
           'education_level' => $request->education_level,
           'email_verified_at' => now(),
       ]);

       $token = $user->createToken('quiz-token')->plainTextToken;

       return response()->json([
           'user' => $user,
           'token' => $token,
       ], 201);
   }

   public function googleMobileLogin(Request $request)
   {
       // 1. 接收来自 App 的令牌
       $token = $request->input('token');

       try {
           // 2. 移动端通常更适合验证 userinfo 接口（如果是 Access Token）
           $response = \Illuminate\Support\Facades\Http::withoutVerifying()
               ->get("https://oauth2.googleapis.com/tokeninfo?id_token={$token}");

           if ($response->failed()) {
               return response()->json(['error' => 'Validation failed', 'details' => $response->json()], 401);
           }

           $googleData = $response->json();
           $email = $googleData['email'];
           $googleId = $googleData['sub']; // Google 唯一标识

           // 3. 查找或准备创建用户
           $user = User::where('google_id', $googleId)->orWhere('email', $email)->first();

           if (!$user) {
               return response()->json([
                   'needs_completion' => true,
                   'user' => [
                       'email' => $email,
                       'google_id' => $googleId,
                       'nickname' => $googleData['name'] ?? null,
                       'avatar' => $googleData['picture'] ?? null
                   ]
               ]);
           }

           // 4. 发放圣典令牌
           $sanctumToken = $user->createToken('mobile-auth-token')->plainTextToken;
           return response()->json([
               'token' => $sanctumToken,
               'user' => $user,
               'needs_completion' => false
           ]);

       } catch (\Exception $e) {
           return response()->json(['error' => $e->getMessage()], 500);
       }
   }

   public function verify(Request $request, $id, $hash)
   {
       // 1. 物理定位用户 [cite: 2026-03-15]
       $user = User::findOrFail($id);

       // 2. 校验签名 Hash（防止恶意篡改 ID 激活他人账号） [cite: 2026-03-15]
       if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
           return response()->json(['message' => 'Lien de vérification invalide.'], 403);
       }

       // 3. 检查是否已激活，避免重复写入
       if ($user->email_verified_at !== null) {
           return response()->json(['message' => 'Compte déjà activé.'], 200);
       }

       $user->email_verified_at = now();
       $user->save();

       return response()->json(['message' => 'Votre compte a été activé avec succès !'], 200);
   }

   public function resendVerificationByEmail(Request $request)
   {
       $request->validate(['email' => 'required|email']);

       $user = User::where('email', $request->email)->first();

       // 1. 如果用户不存在，保持沉默或给个模糊提示（安全考虑）
       if (!$user) {
           return response()->json(['message' => 'Si cet email existe, un lien a été envoyé.'], 200);
       }

       // 2. 如果已经验证过了，就没必要再发了
       if ($user->email_verified_at !== null) {
           return response()->json(['message' => 'Ce compte est déjà activé.'], 400);
       }

       // 3. 手动触发发送通知 [cite: 2026-03-15]
       $user->sendEmailVerificationNotification();

       return response()->json(['message' => 'Un nouveau lien de vérification a été envoyé.'], 200);
   }
}
