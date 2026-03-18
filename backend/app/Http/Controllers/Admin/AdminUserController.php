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
    private function authorizeAction(User $me, User $target)
        {
            // 任何人都不能禁用、删除或重置自己的账号
            if ($me->id === $target->id) {
                return ['status' => false, 'code' => 400, 'message' => 'Cannot perform this action on yourself'];
            }

            // 任何人（包括超级管理员）都不能修改超级管理员的账号
            if ($target->isSuperAdmin()) {
                return ['status' => false, 'code' => 403, 'message' => 'The Super Admin account is immutable'];
            }

            // 如果目标是普通管理员，只有超级管理员可以操作
            if ($target->role === 'ADMIN' && !$me->isSuperAdmin()) {
                return ['status' => false, 'code' => 403, 'message' => 'Only the Super Admin can manage other administrators'];
            }

            return ['status' => true];
        }

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
        $target = User::findOrFail($id);
        $auth = $this->authorizeAction(request()->user(), $target);

        if (!$auth['status']) {
            return response()->json(['message' => $auth['message']], $auth['code']);
        }


        $target->is_disabled = !$target->is_disabled;
        $target->save();

        return response()->json([
            'message' => $target->is_disabled ? 'User disabled' : 'User enabled',
            'data' => [
                'id' => $target->id,
                'is_disabled' => $target->is_disabled,
            ],
        ]);

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
