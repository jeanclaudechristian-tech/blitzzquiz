<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\GroupController;
use App\Models\Quiz;

// Routes Google existantes
Route::get('auth/google/redirect', [AuthController::class, 'googleRedirect']);
//Route::post('auth/google/callback', [AuthController::class, 'googleCallback']);
Route::post('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// --- NOUVELLES ROUTES POUR LE FLUX GOOGLE ---
Route::post('auth/check-google', [AuthController::class, 'checkGoogleUser']);
Route::post('auth/google-register', [AuthController::class, 'registerGoogleFinal']);
// -------------------------------------------

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);

Route::get('/quizzes', [QuizController::class, 'index']);
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show']);
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']);
    
    Route::get('/quizzes/{quiz}/questions', [QuizController::class, 'questionsIndex']);
    Route::post('/quizzes/{quiz}/questions', [QuizController::class, 'questionsStore']);
    Route::put('/questions/{question}', [QuizController::class, 'questionsUpdate']);
    Route::delete('/questions/{question}', [QuizController::class, 'questionsDestroy']);
});

