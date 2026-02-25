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

    public function checkGoogleUser(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->role === 'TEACHER') {
            return response()->json(['message' => 'Teachers must use password login'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 200);
    }

    public function registerGoogleFinal(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'username' => 'nullable|string',
            'nickname' => 'nullable|string',
            'supabase_id' => 'required|string',
            'education_level' => 'required|string',
        ]);

        $usernameValue = $request->username ?? $request->nickname;

        if (!$usernameValue) {
            return response()->json([
                'errors' => ['username' => ['The username field is required.']]
            ], 422);
        }

        // Vérifier si l'utilisateur existe déjà
        $existingUser = User::where('email', $request->email)->first();

        if ($existingUser) {
            // Mettre à jour l'utilisateur existant
            $existingUser->update([
                'nickname' => $usernameValue,
                'education_level' => $request->education_level,
                'supabase_id' => $request->supabase_id,
                'avatar' => $request->avatar ?? $existingUser->avatar,
            ]);

            $token = $existingUser->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $existingUser,
                'token' => $token
            ], 200);
        }

        // Créer un nouvel utilisateur
        $user = User::create([
            'nickname' => $usernameValue,
            'email' => $request->email,
            'password' => Hash::make(Str::random(32)),
            'role' => 'STUDENT',
            'education_level' => $request->education_level,
            'supabase_id' => $request->supabase_id,
            'avatar' => $request->avatar ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $accessToken = $request->input('access_token');
            $refreshToken = $request->input('refresh_token');
            $supabaseUser = $request->input('user');

            if (!$accessToken || !$supabaseUser) {
                return response()->json(['message' => 'Token ou utilisateur manquant'], 400);
            }

            // Chercher l'utilisateur par email
            $user = User::where('email', $supabaseUser['email'])->first();

            if (!$user) {
                // Créer un utilisateur temporaire (sera complété plus tard)
                $user = User::create([
                    'email' => $supabaseUser['email'],
                    'nickname' => $supabaseUser['user_metadata']['name'] ?? explode('@', $supabaseUser['email'])[0],
                    'password' => Hash::make(Str::random(32)),
                    'role' => 'STUDENT',
                    'supabase_id' => $supabaseUser['id'],
                    'avatar' => $supabaseUser['user_metadata']['avatar_url'] ?? null,
                ]);

                // Indiquer que le profil doit être complété
                return response()->json([
                    'success' => true,
                    'needs_completion' => true,
                    'user' => $user,
                    'token' => $user->createToken('auth_token')->plainTextToken
                ], 200);
            } else {
                // Mettre à jour les infos Supabase si nécessaire
                $user->update([
                    'supabase_id' => $supabaseUser['id'],
                    'avatar' => $supabaseUser['user_metadata']['avatar_url'] ?? $user->avatar,
                ]);

                // Vérifier si le profil est complet
                $needsCompletion = empty($user->education_level);

                return response()->json([
                    'success' => true,
                    'needs_completion' => $needsCompletion,
                    'user' => $user,
                    'token' => $user->createToken('auth_token')->plainTextToken
                ], 200);
            }
        } catch (\Exception $e) {
            Log::error('Erreur Google callback: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur: ' . $e->getMessage()], 500);
        }
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
        $googleUser = Socialite::driver('google')->stateless()->user();

        $user = User::updateOrCreate(
            ['google_id' => $googleUser->id],
            [
                'email' => $googleUser->email,
                'nickname' => $googleUser->name,
                'avatar' => $googleUser->avatar ?? null,
                'password' => Hash::make(Str::random(40)),
            ]
        );

        $token = $user->createToken('quiz-google-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }
}
