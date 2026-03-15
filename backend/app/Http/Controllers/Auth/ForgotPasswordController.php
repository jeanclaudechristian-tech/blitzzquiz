<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class ForgotPasswordController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'message' => 'Reset password email sent.',
        ]);
    }

    public function sendPasswordResetNotification($token)
    {
        // 1. 手动拼接指向 Vercel 的前端链接 [cite: 1, 2026-03-15]
        $url = env('FRONTEND_URL') . '/reset-password?token=' . $token . '&email=' . $this->email;

        // 2. 触发异步通知（需创建自定义 Notification 并实现 ShouldQueue） [cite: 2026-03-15]
        $this->notify(new \App\Notifications\ResetPasswordNotification($url));
    }
}
