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


    //ROUTES FOR THE GROUPS
    Route::apiResource('groups', GroupController::class)->only(['index', 'show']);
    Route::post('groups', [GroupController::class, 'store']);
    Route::apiResource('groups', GroupController::class)->only(['update', 'destroy'])->where(['group' => '[0-9]+']);
    Route::post('groups/{group}/join', [GroupController::class, 'join']);
    Route::post('groups/{group}/members', [GroupController::class, 'addMember']);
    Route::delete('groups/{group}/leave', [GroupController::class, 'leave']);

});
