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
use App\Notifications\CustomVerifyEmailNotification;

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
        'is_disabled',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_disabled' => 'boolean',
        ];
    }

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
        $url = env('FRONTEND_URL') . '/reset-password?token=' . $token . '&email=' . $this->email;
        $this->notify(new \App\Notifications\ResetPasswordNotification($url));
    }

    public function sendEmailVerificationNotification()
    {
        $temporarySignedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $this->getKey(), 'hash' => sha1($this->getEmailForVerification())]
        );

        $url = env('FRONTEND_URL') . '/verify-email?queryURL=' . urlencode($temporarySignedUrl);

        $this->notify(new CustomVerifyEmailNotification($url));
    }

    public function isSuperAdmin(): bool
    {
        $adminEmailsString = env('SUPER_ADMIN_EMAILS', '');
        $adminEmails = array_filter(array_map('trim', explode(',', $adminEmailsString)));

        return $this->role === 'ADMIN' && in_array($this->email, $adminEmails, true);
    }

    public function setIsDisabledAttribute($value)
    {
        // filter_var 可以把 '0', 0, 'false', false 等都正确转为真正的布尔 bool
        $this->attributes['is_disabled'] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
}
