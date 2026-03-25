<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->select([
            'id',
            'email',
            'nickname',
            'role',
            'education_level',
            'is_disabled',
            'created_at',
        ]);

        if ($request->filled('q')) {
            $q = $request->q;
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
        try {
            $me = request()->user();

            if (!$me) {
                return response()->json([
                    'message' => 'Unauthenticated',
                ], 401);
            }

            $target = User::findOrFail($id);

            $auth = $this->authorizeAction($me, $target);

            if (!$auth['status']) {
                return response()->json([
                    'message' => $auth['message'],
                ], $auth['code']);
            }

            DB::statement(
                'UPDATE users SET is_disabled = NOT is_disabled, updated_at = NOW() WHERE id = ?',
                [$target->id]
            );

            $target->refresh();

            if ((bool) $target->is_disabled) {
                $target->tokens()->delete();
            }

            return response()->json([
                'message' => $target->is_disabled ? 'User disabled' : 'User enabled',
                'data' => [
                    'id' => $target->id,
                    'is_disabled' => (bool) $target->is_disabled,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Server Error',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ], 500);
        }
    }

    private function authorizeAction($me, $target): array
    {
        if ($me->id === $target->id) {
            return [
                'status' => false,
                'message' => 'Vous ne pouvez pas modifier votre propre compte.',
                'code' => 403,
            ];
        }

        if ($target->isSuperAdmin()) {
            return [
                'status' => false,
                'message' => 'Impossible de modifier un super admin.',
                'code' => 403,
            ];
        }

        if ($target->role === 'ADMIN' && !$me->isSuperAdmin()) {
            return [
                'status' => false,
                'message' => 'Seul le super admin peut modifier un admin.',
                'code' => 403,
            ];
        }

        return [
            'status' => true,
            'message' => 'OK',
            'code' => 200,
        ];
    }
}
