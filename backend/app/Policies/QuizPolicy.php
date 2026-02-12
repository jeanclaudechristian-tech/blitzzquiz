<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Quiz;

class QuizPolicy
{
    /**
     * Only TEACHER or ADMIN can create a quiz
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['TEACHER', 'ADMIN'], true);
    }
}
