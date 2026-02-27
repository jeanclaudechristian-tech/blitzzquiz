<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ProfileController;
use App\Models\Quiz;

// Routes Google existantes
Route::get('auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::post('auth/google/callback', [AuthController::class, 'googleCallback']);
Route::post('auth/google-register', [AuthController::class, 'registerGoogleFinal']);



Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);

    // =========================
    // Profile (Profil)
    // =========================

    Route::get('/me', [ProfileController::class, 'me']);

    //  email / username / niveau d'études
    Route::patch('/me', [ProfileController::class, 'update']);

    // password
    Route::patch('/me/password', [ProfileController::class, 'password']);


Route::get('/quizzes', [QuizController::class, 'index']);
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show']);
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']);

    Route::get('/groups', [GroupController::class, 'index']);
    Route::post('groups/join', [GroupController::class, 'join']);
    Route::get('/groups/{group}', [GroupController::class, 'show']);
    Route::put('/groups/{group}', [GroupController::class, 'update']);
    Route::post('/groups', [GroupController::class, 'store']);
    Route::post('groups/{group}/members', [GroupController::class, 'addMember']);
    Route::delete('groups/{group}/leave', [GroupController::class, 'leave']);
    Route::delete('groups/{group}/destroy', [GroupController::class, 'destroy']);

    Route::get('/quizzes/{quiz}/questions', [QuizController::class, 'questionsIndex']);
    Route::post('/quizzes/{quiz}/questions', [QuizController::class, 'questionsStore']);

    Route::put('/questions/{question}', [QuizController::class, 'questionsUpdate']);
    Route::delete('/questions/{question}', [QuizController::class, 'questionsDestroy']);
});

