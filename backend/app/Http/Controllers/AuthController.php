<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;



class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users',
            'nickname' => 'required|string|max:50',
            'password' => 'required|min:8|confirmed',
            'role' => 'required|in:TEACHER,STUDENT',
        ]);

        $user = User::create([
            'email' => $request->email,
            'nickname' => $request->nickname,
            'password' => Hash::make($request->password),
            'role' => $request->input('role', 'STUDENT'),
        ]);

        $token = $user->createToken('quiz-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
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
        // 1. 拦截空 Token
        if (!$request->token) {
            return response()->json(['message' => 'Token 不能为空'], 400);
        }

        try {
            // 2. 正常请求 Google
            $googleUser = \Laravel\Socialite\Facades\Socialite::driver('google')->stateless()->userFromToken($request->token);

            // 3. 处理用户数据 (用邮箱匹配，防止 500 报错)
            $user = \App\Models\User::updateOrCreate(
                ['email' => $googleUser->email],
                [
                    'google_id' => $googleUser->id,
                    'nickname' => $googleUser->name,
                    'avatar' => $googleUser->avatar ?? null,
                    'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(40)),
                ]
            );

            $token = $user->createToken('quiz-google-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
            ]);

        } catch (\GuzzleHttp\Exception\ClientException $e) {
            // 🛑 第一重逮捕：专门抓 Google 返回的 400/401 错误
            // 这里能直接拿到 Google 的“原话”
            $googleResponse = $e->getResponse()->getBody()->getContents();
            \Illuminate\Support\Facades\Log::error('Google 拒绝了验证: ' . $googleResponse);

            return response()->json([
                'error' => 'Google 拒绝了你的 Token',
                'details' => json_decode($googleResponse) // 把原话转成 JSON 发给前端
            ], 400);

        } catch (\Exception $e) {
            // 🛑 第二重逮捕：抓其他所有代码运行错误
            \Illuminate\Support\Facades\Log::error('Google 验证时代码崩溃: ' . $e->getMessage());

            return response()->json([
                'error' => '后端处理验证时出错',
                'details' => $e->getMessage()
            ], 400);
        }
    }
}

