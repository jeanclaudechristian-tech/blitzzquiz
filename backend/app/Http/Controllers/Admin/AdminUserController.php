<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('q');

        $query = User::query()
            ->select([
                'id',
                'email',
                'nickname',
                'role',
                'education_level',
                'is_disabled',
                'created_at'
            ]);

        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('email', 'like', "%{$q}%")
                    ->orWhere('nickname', 'like', "%{$q}%");
            });
        }

        return response()->json([
            'data' => $query->orderByDesc('id')->paginate(20),
        ]);
    }

    public function disable($id)
    {
        $user = User::findOrFail($id);
        if (request()->user()->id === $user->id) {
            return response()->json([
                'message' => 'Cannot disable yourself'
            ], 400);
        }

        $user->is_disabled = !$user->is_disabled;
        $user->save();

        return response()->json([
            'message' => $user->is_disabled ? 'User disabled' : 'User enabled',
            'data' => [
                'id' => $user->id,
                'is_disabled' => $user->is_disabled,
            ],
        ]);
    }
}
