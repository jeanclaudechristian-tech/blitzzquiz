<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class ImpersonationController extends Controller
{
    public function impersonate(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $targetUser = User::findOrFail($validated['user_id']);

        $token = JWTAuth::fromUser($targetUser);

        return response()->json([
            'message' => 'Impersonation successful',
            'token' => $token,
            'impersonated_user' => [
                'id' => $targetUser->id,
                'email' => $targetUser->email,
                'nickname' => $targetUser->nickname,
                'role' => $targetUser->role,
                'education_level' => $targetUser->education_level,
            ],
        ], 200);
    }
}
