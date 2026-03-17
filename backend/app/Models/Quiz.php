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
        'is_public' => 'boolean', // 🎯 Important pour que Laravel traite la colonne comme un booléen
    ];

    /**
     * Relation vers la table categories
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relation vers l'utilisateur (créateur du quiz)
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Relation vers les questions
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'quiz_id');
    }

    /**
     * Relation vers les résultats (tentatives)
     */
    public function results(): HasMany
    {
        return $this->hasMany(Result::class, 'quiz_id');
    }

    /**
     * Scope pour la recherche Full-Text Postgres (tsvector)
     */
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