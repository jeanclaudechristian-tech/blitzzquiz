<?php
namespace App\Http\Controllers;

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
            'username' => 'nullable|string|max:50',
            'nickname' => 'nullable|string|max:50',
            'password' => 'required|min:8|confirmed',
            'role' => 'required|in:TEACHER,STUDENT',
            'education_level' => 'nullable|string|max:100',
        ]);

        // Utiliser username s'il existe, sinon nickname
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

    // --- NOUVELLES MÉTHODES GOOGLE ---

    public function checkGoogleUser(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // 404 = User n'existe pas -> Déclenche Inscription
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->role === 'TEACHER') {
            // 403 = Prof interdit -> Bloque
            return response()->json(['message' => 'Teachers must use password login'], 403);
        }

        // 200 = User existe -> Connecte
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 200);
    }

    public function registerGoogleFinal(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'username' => 'required|string|unique:users,nickname',
            'google_id' => 'required|string',
            'niveau' => 'required|string',
        ]);

        $user = User::create([
            'nickname' => $request->username, // On utilise le username choisi
            'email' => $request->email,
            'password' => Hash::make(Str::random(32)), // Mdp aléatoire
            'role' => 'STUDENT', // Toujours STUDENT
            'education_level' => $request->niveau, // Champ niveau
            'google_id' => $request->google_id,
            'avatar' => $request->avatar ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }
    // ---------------------------------

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
