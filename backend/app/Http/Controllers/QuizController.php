<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Broadcast;

class QuizController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:100',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
        ]);

       $user = Auth::user();
               if (!$user) {
                   return response()->json(['error' => 'Auth required'], 401);
               }


               if (!in_array($user->role, ['TEACHER', 'ADMIN'], true)) {
                   return response()->json(['error' => 'Forbidden'], 403);
               }

               // Unique code (évite collision)
               do {
                   $code = strtoupper(Str::random(6));
               } while (Quiz::where('code_quiz', $code)->exists());

               $quiz = Quiz::create($validated + [
                   'code_quiz' => $code,
                   'owner_id' => $user->id,
               ]);

               return response()->json($quiz->load('questions'), 201);
           }
       }
