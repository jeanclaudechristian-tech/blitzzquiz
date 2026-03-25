<?php

namespace App\Http\Controllers;

use App\Services\SupabaseStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
            'db_name' => DB::connection()->getDatabaseName(),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'email' => [
                'sometimes',
                'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'nickname' => [
                'sometimes',
                'string',
                'min:3',
                'max:50',
                Rule::unique('users', 'nickname')->ignore($user->id),
            ],
            'education_level' => [
                'sometimes',
                'string',
                'max:100',
            ],
        ]);

        $user->fill($validated);
        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour',
            'user' => $user,
        ]);
    }

    public function uploadAvatar(Request $request, SupabaseStorageService $supabaseStorage)
    {
        $user = $request->user();

        $validated = $request->validate([
            'avatar' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
        ]);

        if (!$supabaseStorage->enabled()) {
            return response()->json([
                'message' => 'Le stockage de photos de profil nest pas configure.',
            ], 503);
        }

        try {
            $avatarUrl = $supabaseStorage->uploadUploadedFile($validated['avatar']);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Erreur lors du televersement de la photo de profil.',
            ], 422);
        }

        $previousAvatar = $user->avatar;
        $user->avatar = $avatarUrl;
        $user->save();

        if ($previousAvatar && $previousAvatar !== $avatarUrl && $supabaseStorage->isManagedPublicUrl($previousAvatar)) {
            try {
                $supabaseStorage->deleteByPublicUrl($previousAvatar);
            } catch (\Throwable $exception) {
                report($exception);
            }
        }

        return response()->json([
            'message' => 'Photo de profil mise a jour.',
            'user' => $user,
        ]);
    }

    public function password(Request $request)
    {
        $user = $request->user();

        if (!empty($user->google_id) || !empty($user->apple_id)) {
            return response()->json([
                'message' => 'Ce compte utilise une authentification externe (Google/Apple).',
            ], 403);
        }

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            ],
        ], [
            'current_password.required' => 'Le mot de passe actuel est requis.',
            'new_password.required' => 'Le nouveau mot de passe est requis.',
            'new_password.min' => 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
            'new_password.confirmed' => 'La confirmation du nouveau mot de passe ne correspond pas.',
            'new_password.regex' => 'Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.',
        ]);

        // Vérifier ancien mot de passe
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Mot de passe actuel invalide',
                'errors' => [
                    'current_password' => ['Mot de passe actuel invalide']
                ]
            ], 422);
        }

        // Empêcher de réutiliser le même mot de passe
        if (Hash::check($validated['new_password'], $user->password)) {
            return response()->json([
                'message' => 'Le nouveau mot de passe doit être différent de l’ancien',
                'errors' => [
                    'new_password' => ['Le nouveau mot de passe doit être différent de l’ancien']
                ]
            ], 422);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'message' => 'Mot de passe modifié avec succès'
        ]);
    }
}
