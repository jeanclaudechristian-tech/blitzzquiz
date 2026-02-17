<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\GroupController;
use App\Models\Quiz;

Route::get('auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::post('auth/google/callback', [AuthController::class, 'googleCallback']);

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);

    // Only TEACHER/ADMIN can create quiz
    Route::post('quizzes', [QuizController::class, 'store'])
        ->middleware('can:create,' . Quiz::class);

    Route::apiResource('quizzes', QuizController::class);
    Route::post('quizzes/{quiz}/join', [QuizController::class, 'join']);
});

