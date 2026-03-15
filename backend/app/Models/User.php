<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\URL;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'email',
        'password',
        'nickname',
        'role',
        'education_level',
        'avatar',
        'google_id',
        'apple_id',
        'supabase_id',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // =========================================================
    // Relations (UML aligned)
    // =========================================================


    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'owner_id');
    }


    public function ownedGroups(): HasMany
    {
        return $this->hasMany(Group::class, 'owner_id');
    }


    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'user_groups', 'user_id', 'group_id');
    }


    public function results(): HasMany
    {
        return $this->hasMany(Result::class, 'user_id');
    }

    public function sendPasswordResetNotification($token)
    {
        // 1. 获取你在 .env 中定义的 Vercel 前端地址 [cite: 1, 2026-03-15]
        // 确保链接格式为：https://your-vercel-app.com/reset-password?token=xxx&email=xxx
        $url = env('FRONTEND_URL') . '/reset-password?token=' . $token . '&email=' . $this->email;

        // 2. 触发自定义通知类 [cite: 2026-03-15]
        $this->notify(new \App\Notifications\ResetPasswordNotification($url));
    }

    public function sendEmailVerificationNotification()
    {
        // 1. 生成带签名的后端验证 URL（临时有效）
        $temporarySignedUrl = URL::temporarySignedRoute(
            'verification.verify', // 对应 routes/api.php 里的路由名
            now()->addMinutes(60),
            ['id' => $this->getKey(), 'hash' => sha1($this->getEmailForVerification())]
        );

        // 2. 将后端链接作为参数，拼接到 Vercel 的前端页面地址上
        // 最终效果：https://blitzzquiz.vercel.app/verify-email?queryURL=...
        $url = env('FRONTEND_URL') . '/verify-email?queryURL=' . urlencode($temporarySignedUrl);

        // 3. 触发异步通知（确保你已经创建了这个通知类，见第三步） [cite: 1, 2026-03-15]
        $this->notify(new \App\Notifications\CustomVerifyEmailNotification($url));
    }
}
