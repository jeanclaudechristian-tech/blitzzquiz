<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
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
}
