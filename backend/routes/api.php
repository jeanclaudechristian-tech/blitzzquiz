<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuizController;

Route::get('auth/google/redirect', [AuthController::class, 'googleRedirect']);

Route::post('auth/google/callback', [AuthController::class, 'googleCallback']);

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);

    //  Only TEACHER/ADMIN can create
    Route::post('quizzes', [QuizController::class, 'store'])
        ->middleware('can:create,' . Quiz::class);

    Route::apiResource('quizzes', QuizController::class);
    Route::post('quizzes/{quiz}/join', [QuizController::class, 'join']);
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']);
     Route::get('/quizzes/{quiz}/questions', [QuizController::class, 'questionsIndex']);
    Route::post('/quizzes/{quiz}/questions', [QuizController::class, 'questionsStore']);
    Route::put('/questions/{question}', [QuizController::class, 'questionsUpdate']);
    Route::delete('/questions/{question}', [QuizController::class, 'questionsDestroy']);
       

});

