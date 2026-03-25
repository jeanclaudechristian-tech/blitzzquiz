<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use App\Notifications\AdminInvitationNotification;
use App\Notifications\AdminResetPasswordNotification;

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

    public function destroy($id)
   {
       $target = User::findOrFail($id);
       $auth = $this->authorizeAction(request()->user(), $target);

       if (!$auth['status']) {
           return response()->json(['message' => $auth['message']], $auth['code']);
       }

       $target->delete();

       return response()->json([
           'message' => 'User deleted successfully'
       ]);
   }

   public function resetPassword($id)
   {
       $target = User::findOrFail($id);
       $auth = $this->authorizeAction(request()->user(), $target);

       if (!$auth['status']) {
           return response()->json(['message' => $auth['message']], $auth['code']);
       }

       $newPassword = Str::random(12);
       $target->password = Hash::make($newPassword);
       $target->save();

       // 触发邮件通知
       $target->notify(new AdminResetPasswordNotification($newPassword));

       return response()->json([
           'message' => 'Password reset',
           'data' => [
               'id' => $target->id,
               'temporary_password' => $newPassword,
           ],
       ]);
   }
   public function inviteAdmin(Request $request)
   {
       $request->validate([
           'email' => 'required|email',
       ]);

       $email = $request->email;
       $user = User::where('email', $email)->first();
       $temporaryPassword = null;
       $isNewUser = false;

       if ($user) {
           // 情况 A：用户已存在，直接提升权限
           $user->role = 'ADMIN';
           $user->save();
       } else {
           // 情况 B：用户不存在，创建新账号
           $isNewUser = true;
           $temporaryPassword = Str::random(12); // 生成12位随机密码

           // 截取邮箱前缀作为默认昵称
           $nickname = explode('@', $email)[0];

           $user = User::create([
               'email' => $email,
               'nickname' => $nickname,
               'password' => Hash::make($temporaryPassword),
               'role' => 'ADMIN',
               'is_disabled' => false,
           ]);
       }

       $user->notify(new AdminInvitationNotification($temporaryPassword, $isNewUser));

       return response()->json([
           'message' => $isNewUser ? 'Admin account created and invitation sent' : 'User promoted to admin and notified',
           'data' => [
               'email' => $user->email,
               'role' => $user->role
           ]
       ]);
   }
}
