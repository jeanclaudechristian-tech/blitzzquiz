<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Admin\ImpersonationController;

// ==========================================
//  ROUTES PUBLIQUES
// ==========================================

// Auth Google
Route::get('auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::post('auth/google/callback', [AuthController::class, 'googleCallback']);
Route::post('auth/google-register', [AuthController::class, 'registerGoogleFinal']);
Route::post('auth/google-mobile', [AuthController::class, 'googleMobileLogin']);

// Auth Standard
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Mots de passe
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('/reset-password', [ResetPasswordController::class, 'reset']);

// Vérification Email
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/resend-verification', [AuthController::class, 'resendVerificationByEmail']);

// Catalogue / Recherche
Route::get('/quizzes/public', [QuizController::class, 'publicIndex']);
Route::get('/quizzes/search', [QuizController::class, 'search']);

Route::get('/categories', function () {
    return response()->json(\App\Models\Category::all());
});

// ==========================================
// ROUTES PROTÉGÉES (auth:sanctum)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {

    // --- Profil & Auth ---
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);

    Route::get('/me', [ProfileController::class, 'me']);
    Route::patch('/me', [ProfileController::class, 'update']);
    Route::patch('/me/password', [ProfileController::class, 'password']);
    Route::put('/auth/password', [ProfileController::class, 'password']);

    // --- Quizzes ---
    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show']);
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']);
    Route::get('/quizzes/code/{code}', [QuizController::class, 'findByCode']);
    Route::post('/quizzes/{quiz}/results', [QuizController::class, 'storeResult']);

    // --- Questions ---
    Route::get('/quizzes/{quiz}/questions', [QuizController::class, 'questionsIndex']);
    Route::post('/quizzes/{quiz}/questions', [QuizController::class, 'questionsStore']);
    Route::put('/questions/{question}', [QuizController::class, 'questionsUpdate']);
    Route::delete('/questions/{question}', [QuizController::class, 'questionsDestroy']);

    // --- Résultats Utilisateur ---
    Route::get('/me/results', [QuizController::class, 'myResults']);

    // --- Groupes ---
    Route::get('/groups', [GroupController::class, 'index']);
    Route::post('/groups', [GroupController::class, 'store']);
    Route::post('/groups/join', [GroupController::class, 'join']);
    Route::get('/groups/{group}', [GroupController::class, 'show']);
    Route::put('/groups/{group}', [GroupController::class, 'update']);
    Route::delete('/groups/{group}', [GroupController::class, 'destroy']);

    // Membres du groupe
    Route::post('/groups/{group}/members/invite', [GroupController::class, 'inviteByEmail']);
    Route::post('/groups/{group}/members', [GroupController::class, 'addMember']);
    Route::delete('/groups/{group}/members/{user}', [GroupController::class, 'removeMember']);
    Route::delete('/groups/{group}/leave', [GroupController::class, 'leave']);

    // Assignments & Quiz du groupe
    Route::get('/groups/{group}/quizzes', [GroupController::class, 'quizzes']);
    Route::get('/groups/{group}/getQuizzes', [GroupController::class, 'getQuizzes']);
    Route::post('/groups/{group}/assignments', [GroupController::class, 'assignQuiz']);
    Route::delete('/groups/{group}/assignments/{quiz}', [GroupController::class, 'unassignQuiz']);
    Route::get('/groups/{group}/quizzes/{quiz}/ranking', [GroupController::class, 'quizRanking']);

    // ==========================================
    // ADMIN (TEACHER ONLY)
    // ==========================================
    Route::middleware('admin')->prefix('admin')->group(function () {

        Route::get('/users', [\App\Http\Controllers\Admin\AdminUserController::class, 'index']);
        Route::patch('/users/{id}/disable', [\App\Http\Controllers\Admin\AdminUserController::class, 'disable']);
        Route::delete('/users/{id}', [\App\Http\Controllers\Admin\AdminUserController::class, 'destroy']);
        Route::post('/users/{id}/reset-password', [\App\Http\Controllers\Admin\AdminUserController::class, 'resetPassword']);

        // Impersonation
        Route::post('/impersonate', [ImpersonationController::class, 'impersonate']);
    });
});
