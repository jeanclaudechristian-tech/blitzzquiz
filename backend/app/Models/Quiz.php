<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

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
        'image_path',
        'plays_count',
    ];

    protected $appends = ['category', 'image'];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function getCategoryAttribute(): string
    {
        return $this->categoryRelation ? $this->categoryRelation->name : 'General';
    }

    public function getImageAttribute(): ?string
    {
        if (!$this->image_path) {
            return null;
        }

        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
            return $this->image_path;
        }

        return Storage::disk('public')->url($this->image_path);
    }

    public function categoryRelation(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function category(): BelongsTo
    {
        return $this->categoryRelation();
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

