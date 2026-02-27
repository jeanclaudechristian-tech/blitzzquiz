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
}
