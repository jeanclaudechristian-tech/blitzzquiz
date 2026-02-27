<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Question;
use App\Models\Result;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class QuizController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titre'           => 'required|string|max:100',
            'description'     => 'nullable|string',
            'category'        => 'nullable|string|max:255',
            'is_public'       => 'boolean',
            'education_level' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Auth required'], 401);
        }

        if (! in_array($user->role, ['TEACHER', 'ADMIN'], true)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        do {
            $code = strtoupper(Str::random(6));
        } while (Quiz::where('code_quiz', $code)->exists());

        $quiz = Quiz::create($validated + [
            'code_quiz' => $code,
            'owner_id'  => $user->id,
        ]);

        return response()->json($quiz->load('questions'), 201);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'TEACHER' || $user->role === 'ADMIN') {
            $quizzes = Quiz::withCount('questions')
                ->where(function ($q) use ($user) {
                    $q->where('owner_id', $user->id)
                      ->orWhere('is_public', true);
                })
                ->latest()
                ->get();

        } elseif ($user->role === 'STUDENT') {
            $quizzes = Quiz::withCount('questions')
                ->where('is_public', true)
                ->when($user->education_level, function ($q) use ($user) {
                    $q->where(function ($sub) use ($user) {
                        $sub->whereNull('education_level')
                            ->orWhere('education_level', $user->education_level);
                    });
                })
                ->latest()
                ->get();

        } else {
            return response()->json(['error' => 'Rôle non autorisé'], 403);
        }

        return response()->json($quizzes);
    }

    public function show(Quiz $quiz): JsonResponse
    {
        $user = Auth::user();

        if (! $user) {
            if (! $quiz->is_public) {
                return response()->json(['error' => 'Forbidden'], 403);
            }
        } else {
            if ($user->role === 'ADMIN') {
                // ok
            } elseif ($user->role === 'TEACHER') {
                if ($quiz->owner_id !== $user->id && ! $quiz->is_public) {
                    return response()->json(['error' => 'Forbidden'], 403);
                }
            } elseif ($user->role === 'STUDENT') {
                // étudiant autorisé (public ou privé, car entré via code + id)
            } else {
                return response()->json(['error' => 'Forbidden'], 403);
            }
        }

        $quiz->loadCount('questions');

        return response()->json($quiz);
    }

    public function destroy(Quiz $quiz)
    {
        $user = Auth::user();

        if ($quiz->owner_id !== $user->id && $user->role !== 'ADMIN') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $quiz->delete();

        return response()->json(['message' => 'Quiz supprimé avec succès']);
    }

    public function questionsIndex(Quiz $quiz)
    {
        $user = Auth::user();

        if (! $user) {
            if (! $quiz->is_public) {
                return response()->json(['error' => 'Forbidden'], 403);
            }
        } else {
            if ($user->role === 'ADMIN') {
                // ok
            } elseif ($user->role === 'TEACHER') {
                if ($quiz->owner_id !== $user->id && ! $quiz->is_public) {
                    return response()->json(['error' => 'Forbidden'], 403);
                }
            } elseif ($user->role === 'STUDENT') {
                // étudiant autorisé à voir les questions (public ou privé)
            } else {
                return response()->json(['error' => 'Forbidden'], 403);
            }
        }

        return $quiz->questions()->orderBy('id')->get();
    }

    public function questionsStore(Request $request, Quiz $quiz)
    {
        $user = Auth::user();
        if ($quiz->owner_id !== $user->id && $user->role !== 'ADMIN') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'texte'        => 'required|string',
            'choixA'       => 'required|string',
            'choixB'       => 'required|string',
            'choixC'       => 'required|string',
            'choixD'       => 'required|string',
            'bonneReponse' => 'required|in:A,B,C,D',
            'explication'  => 'nullable|string',
        ]);

        $question = $quiz->questions()->create([
            'type'       => 'QCM',
            'texte'      => $data['texte'],
            'metadata'   => [
                'choixA'       => $data['choixA'],
                'choixB'       => $data['choixB'],
                'choixC'       => $data['choixC'],
                'choixD'       => $data['choixD'],
                'bonneReponse' => $data['bonneReponse'],
            ],
            'explanation' => $data['explication'] ?? null,
        ]);

        return response()->json($question, 201);
    }

    public function questionsUpdate(Request $request, Question $question)
    {
        $user = Auth::user();
        if ($question->quiz->owner_id !== $user->id && $user->role !== 'ADMIN') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'texte'        => 'required|string',
            'choixA'       => 'required|string',
            'choixB'       => 'required|string',
            'choixC'       => 'required|string',
            'choixD'       => 'required|string',
            'bonneReponse' => 'required|in:A,B,C,D',
            'explication'  => 'nullable|string',
        ]);

        $question->update([
            'texte'      => $data['texte'],
            'metadata'   => [
                'choixA'       => $data['choixA'],
                'choixB'       => $data['choixB'],
                'choixC'       => $data['choixC'],
                'choixD'       => $data['choixD'],
                'bonneReponse' => $data['bonneReponse'],
            ],
            'explanation' => $data['explication'] ?? null,
        ]);

        return response()->json($question);
    }

    public function questionsDestroy(Question $question)
    {
        $user = Auth::user();
        if ($question->quiz->owner_id !== $user->id && $user->role !== 'ADMIN') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $question->delete();

        return response()->json(['message' => 'Question supprimée']);
    }

    public function findByCode(string $code): JsonResponse
    {
        $user = Auth::user();

        $quiz = Quiz::where('code_quiz', strtoupper($code))
            ->withCount('questions')
            ->first();

        if (! $quiz) {
            return response()->json(['error' => 'Quiz introuvable'], 404);
        }

        if ($user && $user->role === 'ADMIN') {
            return response()->json($quiz);
        }

        if ($user && $quiz->owner_id === $user->id) {
            return response()->json($quiz);
        }

        if ($user && $user->role === 'STUDENT') {
            return response()->json($quiz);
        }

        if (! $user) {
            return response()->json($quiz);
        }

        return response()->json(['error' => 'Forbidden'], 403);
    }

    public function storeResult(Request $request, Quiz $quiz): JsonResponse
    {
        $user = $request->user();

        if (! $user || $user->role !== 'STUDENT') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'score' => 'required|integer|min:0|max:100',
        ]);

        $result = Result::create([
            'user_id'        => $user->id,
            'quiz_id'        => $quiz->id,
            'score'          => $data['score'],
            'date_tentative' => now(),
        ]);

        return response()->json($result, 201);
    }

    public function myResults(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || $user->role !== 'STUDENT') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $results = Result::with('quiz')
            ->where('user_id', $user->id)
            ->orderByDesc('date_tentative')
            ->get();

        return response()->json($results);
    }
}
