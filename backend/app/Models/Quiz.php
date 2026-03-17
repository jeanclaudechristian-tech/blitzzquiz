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
        'category_id',
        'is_public',
        'code_quiz',
        'owner_id',
        'education_level',
        'plays_count'
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'quiz_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class, 'quiz_id');
    }

    public function scopeSearch($query, string $term)
    {
        if (blank($term)) {
            return $query;
        }

        return $query
            ->whereRaw(
                "search_vector @@ websearch_to_tsquery('french', ?)",
                [$term]
            )
            ->orderByRaw(
                "ts_rank(search_vector, websearch_to_tsquery('french', ?)) DESC",
                [$term]
            );
    }
}