<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Question;
use App\Models\Result;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
{
    /**
     * CRÉER UN QUIZ
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:100',
            'description' => 'nullable|string',
            'category_id' => 'nullable|integer|exists:categories,id',
            'is_public' => 'boolean',
            'education_level' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();
        if (!$user || !in_array($user->role, ['TEACHER', 'ADMIN'], true)) {
            return response()->json(['error' => 'Action non autorisée'], 403);
        }

        do {
            $code = strtoupper(Str::random(6));
        } while (Quiz::where('code_quiz', $code)->exists());

        $quiz = Quiz::create($validated + [
            'code_quiz' => $code,
            'owner_id' => $user->id,
            'plays_count' => 0
        ]);

        return response()->json($quiz->load(['questions', 'category']), 201);
    }

    /**
     * INDEX (UTILISATEURS CONNECTÉS)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // 游客位面逻辑
        if (!$user) {
            return $this->publicIndex($request);
        }

        try {
            // 1. 初始化查询：预加载关联以支持 Accessor 获取 category 字符串
            $query = Quiz::with('categoryRelation')->withCount('questions');

            $weakCategories = [];

            // 2. 权限与等级过滤
            if ($user->role === 'TEACHER' || $user->role === 'ADMIN') {
                $query->where(function ($q) use ($user) {
                    $q->where('owner_id', $user->id)
                      ->orWhereRaw('is_public IS TRUE');
                });
            } elseif ($user->role === 'STUDENT') {
                $query->whereRaw('is_public IS TRUE');

                // 自动筛选符合用户教育等级的内容
                if (!$request->filled('category_id') && $user->education_level) {
                    $query->where(function ($sub) use ($user) {
                        $sub->whereNull('education_level')
                            ->orWhere('education_level', $user->education_level);
                    });
                }

                // --- 核心：以前的推荐逻辑回归 ---

                // A. 获取弱点类别 (平均分 < 70)
                // 这里的 quiz.category 会触发 Quiz 模型的 Accessor 得到字符串名字
                $weakCategories = Result::where('user_id', $user->id)
                    ->with('quiz.categoryRelation')
                    ->get()
                    ->groupBy(fn($r) => $r->quiz->category ?? 'Général')
                    ->map(fn($group) => $group->avg('score'))
                    ->filter(fn($score) => $score < 70)
                    ->keys()
                    ->toArray();

                // B. 获取已尝试过的 Quiz ID
                $attemptedIds = Result::where('user_id', $user->id)->pluck('quiz_id')->unique()->toArray();

                // C. 安全排序：弱点类别的 Quiz 排在最前面
                if (!empty($weakCategories)) {
                    $catList = collect($weakCategories)->map(fn($c) => "'".addslashes($c)."'")->implode(',');
                    $query->orderByRaw("CASE WHEN EXISTS (
                        SELECT 1 FROM categories
                        WHERE categories.id = quizzes.category_id
                        AND categories.name IN ($catList)
                    ) THEN 0 ELSE 1 END");
                }

                // D. 没做过的排在前面
                if (!empty($attemptedIds)) {
                    $idList = implode(',', $attemptedIds);
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

            $recommendedCount = 0;
            $maxRecommended = 3;

            $quizzes->transform(function ($q) use ($weakCategories, &$recommendedCount, $maxRecommended) {
                // 如果属于弱点分类，且还没达到 3 个名额
                if ($recommendedCount < $maxRecommended && in_array($q->category, $weakCategories)) {
                    $q->is_recommended = true;
                    $recommendedCount++;
                } else {
                    $q->is_recommended = false;
                }
                return $q;
            });

            return response()->json($quizzes);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur SQL',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DÉTAILS D'UN QUIZ
     */
    public function show(Quiz $quiz): JsonResponse
    {
        $user = Auth::user();

        if (!$quiz->is_public) {
            if (!$user || ($user->role !== 'ADMIN' && $quiz->owner_id !== $user->id)) {
                return response()->json(['error' => 'Accès refusé'], 403);
            }
        }

        $quiz->load(['questions', 'categoryRelation']);
        $quiz->loadCount('questions');

        return response()->json($quiz);
    }

    /**
     * MODIFIER UN QUIZ
     */
    public function update(Request $request, Quiz $quiz): JsonResponse
    {
        if (Auth::id() !== $quiz->owner_id && Auth::user()->role !== 'ADMIN') {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'titre' => 'string|max:100',
            'description' => 'nullable|string',
            'category_id' => 'nullable|integer|exists:categories,id',
            'is_public' => 'boolean',
            'education_level' => 'nullable|string',
        ]);

        $quiz->update($validated);
        return response()->json($quiz->load('category'));
    }

    /**
     * SUPPRIMER UN QUIZ
     */
    public function destroy(Quiz $quiz): JsonResponse
    {
        if ($quiz->owner_id !== Auth::id() && Auth::user()->role !== 'ADMIN') {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $quiz->delete();
        return response()->json(['message' => 'Quiz supprimé']);
    }

    /**
     * QUESTIONS - INDEX
     */
    public function questionsIndex(Quiz $quiz)
    {
        $user = Auth::user();
        if (!$quiz->is_public && (!$user || ($user->role !== 'ADMIN' && $quiz->owner_id !== $user->id))) {
            return response()->json(['error' => 'Interdit'], 403);
        }

        return response()->json($quiz->questions()->orderBy('id')->get());
    }

    /**
     * QUESTIONS - STORE
     */
    public function questionsStore(Request $request, Quiz $quiz)
    {
        if ($quiz->owner_id !== Auth::id() && Auth::user()->role !== 'ADMIN') {
            return response()->json(['error' => 'Interdit'], 403);
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

    /**
     * QUESTIONS - UPDATE
     */
    public function questionsUpdate(Request $request, Question $question)
    {
        if ($question->quiz->owner_id !== Auth::id() && Auth::user()->role !== 'ADMIN') {
            return response()->json(['error' => 'Interdit'], 403);
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

    /**
     * QUESTIONS - DESTROY
     */
    public function questionsDestroy(Question $question)
    {
        if ($question->quiz->owner_id !== Auth::id() && Auth::user()->role !== 'ADMIN') {
            return response()->json(['error' => 'Interdit'], 403);
        }

        $question->delete();
        return response()->json(['message' => 'Question supprimée']);
    }

    /**
     * RECHERCHE AVANCÉE (POSTGRESQL)
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $request->validate(['q' => 'required|string|min:2|max:100']);
            $term = $request->input('q');

            $quizzes = Quiz::query()
                ->join('categories', 'quizzes.category_id', '=', 'categories.id')
                ->whereRaw('quizzes.is_public IS TRUE')
                ->where(function ($query) use ($term) {
                    $query->whereRaw("quizzes.search_vector @@ websearch_to_tsquery('french', ?)", [$term])
                        ->orWhere('quizzes.titre', 'ILIKE', "%{$term}%")
                        ->orWhere('quizzes.description', 'ILIKE', "%{$term}%")
                        ->orWhere('categories.name', 'ILIKE', "%{$term}%")
                        ->orWhereRaw("similarity(quizzes.titre, ?) > 0.3", [$term]);
                })
                ->orderByRaw("ts_rank(quizzes.search_vector, websearch_to_tsquery('french', ?)) DESC", [$term])
                ->select([
                    'quizzes.id', 'quizzes.titre', 'quizzes.description', 'quizzes.category_id',
                    'quizzes.code_quiz', 'quizzes.education_level', 'quizzes.is_public', 'quizzes.created_at', 'quizzes.plays_count'
                ])
                ->selectRaw("ts_headline('french', coalesce(quizzes.description, ''), websearch_to_tsquery('french', ?), 'StartSel=<mark>, StopSel=</mark>, MaxWords=35, MinWords=15') as description_highlight", [$term])
                ->with(['categoryRelation:id,name'])
                ->withCount('questions')
                ->limit(20)
                ->get();

            return response()->json($quizzes);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur search', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * TROUVER PAR CODE
     */
    public function findByCode(string $code): JsonResponse
    {
        $quiz = Quiz::where('code_quiz', strtoupper($code))
            ->with(['category'])
            ->withCount('questions')
            ->first();

        if (!$quiz) return response()->json(['error' => 'Quiz introuvable'], 404);

        return response()->json($quiz);
    }

    /**
     * ENREGISTRER RÉSULTAT
     */
    public function storeResult(Request $request, Quiz $quiz): JsonResponse
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'STUDENT') {
            return response()->json(['error' => 'Action réservée aux étudiants'], 403);
        }

        $data = $request->validate(['score' => 'required|integer|min:0|max:100']);

        $result = Result::create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => $data['score'],
            'date_tentative' => now(),
        ]);

        $quiz->increment('plays_count');

        return response()->json($result, 201);
    }

    /**
     * MES RÉSULTATS
     */
    public function myResults(): JsonResponse
    {
        $results = Result::with('quiz')
            ->where('user_id', Auth::id())
            ->orderByDesc('date_tentative')
            ->get();

        return response()->json($results);
    }

    /**
     * INDEX PUBLIC (GUESTS)
     */
    public function publicIndex(Request $request): JsonResponse
    {
        try {
            // 🎯 FIX POSTGRES: whereRaw('is_public IS TRUE') pour éviter boolean=integer
            $query = Quiz::with('category')
                ->withCount('questions')
                ->whereRaw('is_public IS TRUE');

            if ($request->filled('category_id')) {
                $val = $request->category_id;
                if (is_numeric($val)) {
                    $query->where('category_id', '=', (int)$val);
                } else {
                    $query->whereHas('category', function($q) use ($val) {
                        $q->where('name', 'ILIKE', $val);
                    });
                }
            }

            if ($request->filled('education_level') && $request->education_level !== 'Tous') {
                $query->where('education_level', $request->education_level);
            }

            if ($request->get('sort') === 'populaire') {
                $query->orderBy('plays_count', 'desc');
            } else {
                $query->latest();
            }

            return response()->json($query->get());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Crash publicIndex',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
