<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            // change email
            'email' => [
                'sometimes',
                'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],

            // change nickname
            'nickname' => [
                'sometimes',
                'string',
                'min:3',
                'max:50',
                Rule::unique('users', 'nickname')->ignore($user->id),
            ],

            // change niveau education
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

    /**
     * change password
     *  current_password + new_password + new_password_confirmation
     */
    public function password(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // check old password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Mot de passe actuel invalide'
            ], 422);
        }

        //upated password
        $user->password = $validated['new_password'];
        $user->save();

        return response()->json([
            'message' => 'Mot de passe modifié'
        ]);
    }
}
