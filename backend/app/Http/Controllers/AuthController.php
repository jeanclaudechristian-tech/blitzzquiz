<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Http;

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
            'is_disabled' => (bool) false,
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

        // 关键：禁用用户禁止登录
        if ((bool) $user->is_disabled) {
            $user->tokens()->delete();

            return response()->json([
                'message' => 'Your account has been disabled.',
            ], 403);
        }

        if ($user->email_verified_at === null) {
            return response()->json([
                'message' => 'Veuillez vérifier votre courriel.',
                'needs_verification' => true
            ], 403);
        }

        $token = $user->createToken('quiz-token')->plainTextToken;

        return response()->json([
            'user'     => $user,
            'token'    => $token,
            'role'     => $user->role,
            'is_super' => $user->isSuperAdmin(),
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

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
        $idToken = $request->input('access_token');

        try {
            $response = Http::withoutVerifying()
                ->get("https://oauth2.googleapis.com/tokeninfo?id_token={$idToken}");

            if ($response->failed()) {
                return response()->json([
                    'error' => 'Google validation failed',
                    'google_error' => $response->json()
                ], 401);
            }

            $googleData = $response->json();

            if ($googleData['aud'] !== env('GOOGLE_CLIENT_ID')) {
                return response()->json(['error' => 'Client ID Mismatch'], 401);
            }

            $email = $googleData['email'];
            $googleId = $googleData['sub'];

            $user = User::where('google_id', $googleId)
                ->orWhere('email', $email)
                ->first();

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

            if ((bool) $user->is_disabled) {
                $user->tokens()->delete();

                return response()->json([
                    'message' => 'Your account has been disabled.',
                ], 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'role' => $user->role,
                'is_super' => $user->isSuperAdmin(),
                'needs_completion' => false
            ]);
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

        $user = User::create([
            'email' => $request->email,
            'nickname' => $request->username,
            'google_id' => $request->google_id,
            'avatar' => $request->avatar,
            'password' => Hash::make(Str::random(24)),
            'role' => $request->role,
            'education_level' => $request->education_level,
            'email_verified_at' => now(),
            'is_disabled' => false,
        ]);

        $token = $user->createToken('quiz-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function googleMobileLogin(Request $request)
    {
        $token = $request->input('token');

        try {
            $response = Http::withoutVerifying()
                ->get("https://oauth2.googleapis.com/tokeninfo?id_token={$token}");

            if ($response->failed()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'details' => $response->json()
                ], 401);
            }

            $googleData = $response->json();
            $email = $googleData['email'];
            $googleId = $googleData['sub'];

            $user = User::where('google_id', $googleId)
                ->orWhere('email', $email)
                ->first();

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

            if ((bool) $user->is_disabled) {
                $user->tokens()->delete();

                return response()->json([
                    'message' => 'Your account has been disabled.',
                ], 403);
            }

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
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Lien de vérification invalide.'], 403);
        }

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

        if (!$user) {
            return response()->json(['message' => 'Si cet email existe, un lien a été envoyé.'], 200);
        }

        if ($user->email_verified_at !== null) {
            return response()->json(['message' => 'Ce compte est déjà activé.'], 400);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Un nouveau lien de vérification a été envoyé.'], 200);
    }
}
