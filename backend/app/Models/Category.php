<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    // Indique à Laravel quelles colonnes il a le droit de manipuler
    protected $fillable = ['name', 'type'];
}