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
            'titre' => 'required|string|max:100',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'is_public' => 'boolean',
            'education_level' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Auth required'], 401);
        }

        if (!in_array($user->role, ['TEACHER', 'ADMIN'], true)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        do {
            $code = strtoupper(Str::random(6));
        } while (Quiz::where('code_quiz', $code)->exists());

        $quiz = Quiz::create($validated + [
            'code_quiz' => $code,
            'owner_id' => $user->id,
        ]);

        return response()->json($quiz->load('questions'), 201);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. 初始化基础查询
        $query = Quiz::withCount('questions');

        $weakCategories = [];

        // 2. 权限与等级过滤
       if ($user->role === 'TEACHER' || $user->role === 'ADMIN') {
           $query->where(function ($q) use ($user) {
               $q->where('owner_id', $user->id)
                 ->orWhereRaw('is_public = true');
           });
       } elseif ($user->role === 'STUDENT') {
           $query->whereRaw('is_public = true')
                 ->when($user->education_level, function ($q) use ($user) {
                     $q->where(function ($sub) use ($user) {
                         $sub->whereNull('education_level')
                             ->orWhere('education_level', $user->education_level);
                     });
                 });

            // --- 核心：更安全的权重计算 ---

            // A. 获取弱点类别 (平均分 < 70)
            // 这里不使用 join，而是通过关联关系或直接查 Result 表
            $weakCategories = Result::where('user_id', $user->id)
                ->with('quiz')
                ->get()
                ->groupBy(fn($r) => $r->quiz->category ?? 'Général')
                ->map(fn($group) => $group->avg('score'))
                ->filter(fn($score) => $score < 70)
                ->keys()
                ->toArray();

            // B. 获取已尝试的 Quiz ID
            $attemptedIds = Result::where('user_id', $user->id)->pluck('quiz_id')->unique()->toArray();

            // C. 安全排序
            if (!empty($weakCategories)) {
                // 使用 findInSet 的逻辑或 field 排序的替代方案
                // 这里用 simple orderByRaw，并对输入进行处理
                $catList = collect($weakCategories)->map(fn($c) => "'".addslashes($c)."'")->implode(',');
                $query->orderByRaw("CASE WHEN category IN ($catList) THEN 0 ELSE 1 END");
            }

            if (!empty($attemptedIds)) {
                $idList = implode(',', $attemptedIds);
                // 没做过的排在前面
                $query->orderByRaw("CASE WHEN id NOT IN ($idList) THEN 0 ELSE 1 END");
            }
        } else {
            return response()->json(['error' => 'Rôle non autorisé'], 403);
        }

        // 3. 基础排序：最新发布
        $query->latest();

        // 4. 分页逻辑
        if ($request->has(['offset', 'limit'])) {
            $query->offset((int)$request->query('offset'))->limit((int)$request->query('limit'));
        }

        $quizzes = $query->get();

        // ✅ 为了防止 500，使用 transform 来安全添加属性
        $quizzes->transform(function ($q) use ($weakCategories) {
            $q->is_recommended = in_array($q->category, $weakCategories ?? []);
            return $q;
        });

        return response()->json($quizzes);
    }

    public function show(Quiz $quiz): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            if (!$quiz->is_public) {
                return response()->json(['error' => 'Forbidden'], 403);
            }
        } else {
            if ($user->role === 'ADMIN') {
                // ok
            } elseif ($user->role === 'TEACHER') {
                if ($quiz->owner_id !== $user->id && !$quiz->is_public) {
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

        if (!$user) {
            if (!$quiz->is_public) {
                return response()->json(['error' => 'Forbidden'], 403);
            }
        } else {
            if ($user->role === 'ADMIN') {
                // ok
            } elseif ($user->role === 'TEACHER') {
                if ($quiz->owner_id !== $user->id && !$quiz->is_public) {
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
            'texte' => 'required|string',
            'choixA' => 'required|string',
            'choixB' => 'required|string',
            'choixC' => 'required|string',
            'choixD' => 'required|string',
            'bonneReponse' => 'required|in:A,B,C,D',
            'explication' => 'nullable|string',
        ]);

        $question = $quiz->questions()->create([
            'type' => 'QCM',
            'texte' => $data['texte'],
            'metadata' => [
                'choixA' => $data['choixA'],
                'choixB' => $data['choixB'],
                'choixC' => $data['choixC'],
                'choixD' => $data['choixD'],
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
            'texte' => 'required|string',
            'choixA' => 'required|string',
            'choixB' => 'required|string',
            'choixC' => 'required|string',
            'choixD' => 'required|string',
            'bonneReponse' => 'required|in:A,B,C,D',
            'explication' => 'nullable|string',
        ]);

        $question->update([
            'texte' => $data['texte'],
            'metadata' => [
                'choixA' => $data['choixA'],
                'choixB' => $data['choixB'],
                'choixC' => $data['choixC'],
                'choixD' => $data['choixD'],
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

        if (!$quiz) {
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

        if (!$user) {
            return response()->json($quiz);
        }

        return response()->json(['error' => 'Forbidden'], 403);
    }

    public function storeResult(Request $request, Quiz $quiz): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->role !== 'STUDENT') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'score' => 'required|integer|min:0|max:100',
        ]);

        $result = Result::create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => $data['score'],
            'date_tentative' => now(),
        ]);

        return response()->json($result, 201);
    }

    public function myResults(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->role !== 'STUDENT') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $results = Result::with('quiz')
            ->where('user_id', $user->id)
            ->orderByDesc('date_tentative')
            ->get();

        return response()->json($results);
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        $term = $request->input('q');

        $quizzes = Quiz::whereRaw('is_public = true')
            ->where(function ($q) use ($term) {
                $q->whereRaw("search_vector @@ websearch_to_tsquery('french', ?)", [$term])
                    ->orWhereRaw("titre ILIKE ?", ["%{$term}%"])
                    ->orWhereRaw("description ILIKE ?", ["%{$term}%"])
                    ->orWhereRaw("category ILIKE ?", ["%{$term}%"])
                    ->orWhereRaw("similarity(titre, ?) > 0.3", [$term])
                    ->orWhereRaw("similarity(coalesce(description, ''), ?) > 0.3", [$term])
                    ->orWhereRaw("similarity(coalesce(category, ''), ?) > 0.3", [$term]);
            })
            ->orderByRaw(
                "ts_rank(search_vector, websearch_to_tsquery('french', ?)) DESC",
                [$term]
            )
            ->select([
                'id',
                'titre',
                'category',
                'description',
                'code_quiz',
                'education_level',
                'is_public'
            ])
            ->selectRaw(
                "ts_headline(
                'french',
                coalesce(description, ''),
                websearch_to_tsquery('french', ?),
                'StartSel=<mark>, StopSel=</mark>, MaxWords=35, MinWords=15'
            ) as description_highlight",
                [$term]
            )
            ->withCount('questions')
            ->limit(20)
            ->get();

        return response()->json($quizzes);
    }

    public function publicIndex(Request $request): JsonResponse
    {
        $quizzes = Quiz::withCount('questions')
            ->whereRaw('is_public IS TRUE')
            ->latest()
            ->get();

        return response()->json($quizzes);
    }
}
