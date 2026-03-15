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

        // 关键：触发注册事件，这将通过你的异步 Queue 发送邮件 [cite: 1, 2026-03-15]
        event(new Registered($user));

        $token = $user->createToken('quiz-token')->plainTextToken;

        return response()->json([
            'message' => 'Veuillez vérifier votre email.', // 提示用户查收邮件
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

        // 1. 验证用户是否存在以及密码是否正确
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credentials incorrects.'],
            ]);
        }

        // 2. 关键：如果未验证，自动补发邮件并禁止本次登录 [cite: 2026-03-15]
        if ($user->email_verified_at === null) {
            // 调用你在 User.php 中重写的发信逻辑
            $user->sendEmailVerificationNotification();

            return response()->json([
                'message' => 'Votre compte n\'est pas encore vérifié. Un nouveau lien de vérification a été envoyé à votre adresse email.',
                'needs_verification' => true
            ], 403);
        }

        // 3. 只有验证过的用户才能拿到令牌
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

   public function verify(Request $request)
   {
       // 2. 手动根据 ID 找到用户，而不是依赖 $request->user()
       $user = User::findOrFail($request->route('id'));

       // 3. 手动进行哈希验证（确保链接没被篡改）
       // 这部分逻辑原本是 EmailVerificationRequest 自动做的
       if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
           return response()->json(['message' => 'Lien de vérification invalide.'], 403);
       }

       // 4. 检查是否已经验证过
       if ($user->hasVerifiedEmail()) {
           return response()->json(['message' => 'Email déjà vérifié.']);
       }

       // 5. 执行验证逻辑
       if ($user->markEmailAsVerified()) {
           event(new \Illuminate\Auth\Events\Verified($user));
       }

       return response()->json([
           'message' => 'Email vérifié avec succès !'
       ]);
   }

   public function resendByEmail(Request $request)
   {
       $request->validate(['email' => 'required|email']);
       $user = User::where('email', $request->email)->first();

       if ($user && $user->email_verified_at === null) {
           $user->sendEmailVerificationNotification();
       }

       // 无论用户是否存在或是否已验证，都返回相同信息以防探测邮箱 [cite: 2026-03-15]
       return response()->json(['message' => 'Si ce compte existe et n\'est pas vérifié, un lien a été envoyé.']);
   }
}
