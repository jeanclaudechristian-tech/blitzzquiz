<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'email',
        'password',
        'nickname',
        'role',
        'avatar',
        'google_id',
        'apple_id',
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
}
