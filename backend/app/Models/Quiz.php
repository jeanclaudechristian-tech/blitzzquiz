<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'description',
        'category',
        'is_public',
        'code_quiz',
        'owner_id',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'quiz_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'quiz_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class, 'quiz_id');
    }
}
