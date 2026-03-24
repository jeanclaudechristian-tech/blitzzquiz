<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Question;
use App\Models\Result;
use App\Models\Category;
use App\Services\SupabaseStorageService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class QuizController extends Controller
{
    public function __construct(
        private readonly SupabaseStorageService $supabaseStorage,
    ) {
    }

    /**
     * Normalize is_public for Postgres writes while keeping API contract unchanged.
     */
    private function normalizeIsPublic(Request $request, array &$validated): void
    {
        if ($request->has('is_public')) {
            $validated['is_public'] = $request->boolean('is_public') ? 'true' : 'false';
        }
    }

    private function canManageQuiz(Quiz $quiz): bool
    {
        $user = Auth::user();
        return (bool) $user && ($quiz->owner_id === $user->id || $user->role === 'ADMIN');
    }

    private function deleteQuizImageFile(?string $path): void
    {
        if (!$path) {
            return;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            if ($this->supabaseStorage->isManagedPublicUrl($path)) {
                $this->supabaseStorage->deleteByPublicUrl($path);
            }
            return;
        }

        $disk = Storage::disk('public');
        if ($disk->exists($path)) {
            $disk->delete($path);
        }
    }
    /**
     * CRÃ‰ER UN QUIZ
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
        $this->normalizeIsPublic($request, $validated);

        $user = Auth::user();
        if (!$user || !in_array($user->role, ['TEACHER', 'ADMIN'], true)) {
            return response()->json(['error' => 'Action non autorisÃ©e'], 403);
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
     * INDEX (UTILISATEURS CONNECTÃ‰S)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. æ¸¸å®¢é€»è¾‘
        if (!$user) {
            return $this->publicIndex($request);
        }

        try {
            // åˆå§‹åŒ–åŸºç¡€æŸ¥è¯¢
            $query = Quiz::with('categoryRelation')->withCount('questions');

            // åˆå§‹åŒ–æŽ¨èæ‰€éœ€çš„å˜é‡
            $weakCategoryIds = [];
            $offset = (int)$request->query('offset', 0);
            $limit = (int)$request->query('limit', 15);

            // 2. æƒé™ä¸Žèº«ä»½é€»è¾‘
            if ($user->role === 'TEACHER' || $user->role === 'ADMIN') {
                $query->where(function ($q) use ($user) {
                    $q->where('owner_id', $user->id)
                      ->orWhereRaw('is_public IS TRUE'); // ä¿ç•™ä½ çš„ Raw å†™æ³•
                });
            } elseif ($user->role === 'STUDENT') {
                $query->whereRaw('is_public IS TRUE');

                // è‡ªåŠ¨ç­›é€‰æ•™è‚²ç­‰çº§
                if (!$request->filled('category_id') && $user->education_level) {
                    $query->where(function ($sub) use ($user) {
                        $sub->whereNull('education_level')
                            ->orWhere('education_level', $user->education_level);
                    });
                }

                // --- æ ¸å¿ƒï¼šå®‰å…¨ä¸”é«˜æ€§èƒ½çš„æŽ¨èç®—æ³• ---

                // A. æ•°æ®åº“çº§èšåˆï¼šèŽ·å–å¹³å‡åˆ† < 70 çš„åˆ†ç±» ID
                $weakCategoryIds = Result::join('quizzes', 'results.quiz_id', '=', 'quizzes.id')
                    ->where('results.user_id', $user->id)
                    ->whereNotNull('quizzes.category_id')
                    ->select('quizzes.category_id')
                    ->groupBy('quizzes.category_id')
                    ->havingRaw('AVG(results.score) < 70')
                    ->pluck('category_id')
                    ->toArray();

                // B. èŽ·å–å·²å°è¯•è¿‡çš„ Quiz ID
                $attemptedIds = Result::where('user_id', $user->id)
                    ->pluck('quiz_id')
                    ->unique()
                    ->toArray();

                // C. å®‰å…¨æŽ’åºï¼šå¼±ç‚¹åˆ†ç±»ç½®é¡¶
                // åªæœ‰å½“æ•°ç»„ä¸ä¸ºç©ºæ—¶æ‰æ‹¼æŽ¥ SQLï¼Œé˜²æ­¢ IN () æŠ¥é”™å¯¼è‡´ App åŠ è½½å¤±è´¥
                if (!empty($weakCategoryIds)) {
                    $catList = implode(',', array_filter($weakCategoryIds));
                    if (!empty($catList)) {
                        $query->orderByRaw("CASE WHEN category_id IN ($catList) THEN 0 ELSE 1 END");
                    }
                }

                // D. å®‰å…¨æŽ’åºï¼šæ²¡åšè¿‡çš„ä¼˜å…ˆ
                if (!empty($attemptedIds)) {
                    $idList = implode(',', array_filter($attemptedIds));
                    if (!empty($idList)) {
                        $query->orderByRaw("CASE WHEN id NOT IN ($idList) THEN 0 ELSE 1 END");
                    }
                }
            } else {
                return response()->json(['error' => 'RÃ´le non autorisÃ©'], 403);
            }

            // 3. åŸºç¡€æŽ’åºï¼šæœ€æ–°å‘å¸ƒ
            $query->latest();

            // 4. æ‰§è¡Œåˆ†é¡µèŽ·å–æ•°æ®
            $quizzes = $query->offset($offset)->limit($limit)->get();

            // 5. æ ‡è®°æŽ¨èé€»è¾‘ (æ ¸å¿ƒä¿®å¤ï¼šé”å®šç¬¬ä¸€é¡µ)
            $recommendedCount = 0;
            $maxRecommended = 3;
            $weakSet = array_flip($weakCategoryIds); // ä½¿ç”¨å“ˆå¸Œè¡¨æé«˜åŒ¹é…æ•ˆçŽ‡

            $quizzes->transform(function ($q) use ($weakSet, &$recommendedCount, $maxRecommended, $offset) {
                // åªæœ‰åœ¨ç¬¬ä¸€é¡µ (offset ä¸º 0) æ—¶æ‰å°è¯•æ‰“â€œæŽ¨èâ€æ ‡ç­¾
                if ($offset === 0 && $recommendedCount < $maxRecommended && isset($weakSet[$q->category_id])) {
                    $q->is_recommended = true;
                    $recommendedCount++;
                } else {
                    $q->is_recommended = false;
                }
                return $q;
            });

            return response()->json($quizzes);

        } catch (\Exception $e) {
            // å¦‚æžœæŠ¥é”™ï¼Œè¿”å›žå…·ä½“ä¿¡æ¯æ–¹ä¾¿ä½ æŽ’æŸ¥å­—æ®µå
            return response()->json([
                'error' => 'SQL Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DÃ‰TAILS D'UN QUIZ
     */
    public function show(Quiz $quiz): JsonResponse
    {
        $user = Auth::user();

        if (!$quiz->is_public && !$user) {
            return response()->json(['error' => 'Acces refuse'], 403);
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
            return response()->json(['error' => 'Non autorisÃ©'], 403);
        }

        $validated = $request->validate([
            'titre' => 'string|max:100',
            'description' => 'nullable|string',
            'category_id' => 'nullable|integer|exists:categories,id',
            'is_public' => 'boolean',
            'education_level' => 'nullable|string',
        ]);
        $this->normalizeIsPublic($request, $validated);

        $quiz->update($validated);
        return response()->json($quiz->load('category'));
    }

    public function uploadImage(Request $request, Quiz $quiz): JsonResponse
    {
        if (!$this->canManageQuiz($quiz)) {
            return response()->json(['error' => 'Non autorise'], 403);
        }

        $validated = $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120|dimensions:min_width=640,min_height=360,max_width=4096,max_height=4096',
        ]);

        $oldPath = $quiz->image_path;
        $newPath = $this->supabaseStorage->enabled()
            ? $this->supabaseStorage->uploadUploadedFile($validated['image'])
            : $validated['image']->store('quiz-images', 'public');

        $quiz->image_path = $newPath;
        $quiz->save();

        $this->deleteQuizImageFile($oldPath);

        return response()->json([
            'message' => 'Image du quiz mise a jour',
            'image' => $quiz->image,
            'quiz' => $quiz->fresh()->load(['categoryRelation'])->loadCount('questions'),
        ]);
    }

    public function setImageUrl(Request $request, Quiz $quiz): JsonResponse
    {
        if (!$this->canManageQuiz($quiz)) {
            return response()->json(['error' => 'Non autorise'], 403);
        }

        $validated = $request->validate([
            'image_url' => 'required|string|max:2048|url',
        ]);

        $oldPath = $quiz->image_path;
        $quiz->image_path = trim($validated['image_url']);
        $quiz->save();

        $this->deleteQuizImageFile($oldPath);

        return response()->json([
            'message' => 'URL image du quiz mise a jour',
            'image' => $quiz->image,
            'quiz' => $quiz->fresh()->load(['categoryRelation'])->loadCount('questions'),
        ]);
    }

    public function deleteImage(Quiz $quiz): JsonResponse
    {
        if (!$this->canManageQuiz($quiz)) {
            return response()->json(['error' => 'Non autorise'], 403);
        }

        $oldPath = $quiz->image_path;
        $quiz->image_path = null;
        $quiz->save();

        $this->deleteQuizImageFile($oldPath);

        return response()->json([
            'message' => 'Image du quiz supprimee',
            'quiz' => $quiz->fresh()->load(['categoryRelation'])->loadCount('questions'),
        ]);
    }

    /**
     * SUPPRIMER UN QUIZ
     */
    public function destroy(Quiz $quiz): JsonResponse
    {
        if ($quiz->owner_id !== Auth::id() && Auth::user()->role !== 'ADMIN') {
            return response()->json(['error' => 'Non autorisÃ©'], 403);
        }

        $this->deleteQuizImageFile($quiz->image_path);
        $quiz->delete();
        return response()->json(['message' => 'Quiz supprimÃ©']);
    }

    /**
     * QUESTIONS - INDEX
     */
    public function questionsIndex(Quiz $quiz)
    {
        $user = Auth::user();

        // Quiz privé : accessible à tout utilisateur connecté (accès par code)
        // Seuls les non-connectés sont bloqués
        if (!$quiz->is_public && !$user) {
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
            'type' => 'required|in:QCM,TF,FILL_IN',
            'texte' => 'required|string',
            'explication' => 'nullable|string',
            'bonneReponse' => 'nullable|string', // QCM is A,B,C,D; TF is Vrai,Faux
        ]);

        $type = $data['type'];
        $metadata = [];

        // 2. 根据类型分流处理不同的结构
        switch ($type) {
            case 'QCM':
                // 只有 QCM 强制要求 A,B,C,D
                $qcmData = $request->validate([
                    'choixA' => 'required|string',
                    'choixB' => 'required|string',
                    'choixC' => 'required|string',
                    'choixD' => 'required|string',
                    'bonneReponse' => 'required|in:A,B,C,D',
                ]);
                $metadata = $qcmData; // 包含选项和正确答案
                break;

            case 'TF':
                // 对错题：后端统一结构，前端只需传 A 或 B
                $tfData = $request->validate([
                    'bonneReponse' => 'required|in:A,B',
                ]);
                $metadata = [
                    'options' => [
                        ['label' => 'Vrai', 'value' => 'A'],
                        ['label' => 'Faux', 'value' => 'B']
                    ],
                    'bonneReponse' => $tfData['bonneReponse']
                ];
                break;

            case 'FILL_IN':
                // 兼容单项和多项填空
                $fillInData = $request->validate([
                    // blanks 是一个数组，每一项代表一个填空位
                    'blanks' => 'required|array|min:1',
                    'blanks.*.accepted_answers' => 'required|array|min:1',
                    'blanks.*.accepted_answers.*' => 'string',
                    'case_sensitive' => 'boolean',
                ]);

                $metadata = [
                    'blanks' => $fillInData['blanks'], // 结构：[{accepted_answers: ['O2', 'o2']}, ...]
                    'case_sensitive' => $fillInData['case_sensitive'] ?? false,
                ];
                break;
        }

        $question = $quiz->questions()->create([
            'type' => $data['type'],
            'texte' => $data['texte'],
            'metadata' => $metadata,
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

        // 1. 基础验证
        $baseData = $request->validate([
            'type' => 'required|in:QCM,TF,FILL_IN', // 允许修改题型
            'texte' => 'required|string',
            'explication' => 'nullable|string',
        ]);

        $type = $baseData['type'];
        $metadata = [];

        // 2. 根据类型重新组装 metadata
        switch ($type) {
            case 'QCM':
                $qcmData = $request->validate([
                    'choixA' => 'required|string',
                    'choixB' => 'required|string',
                    'choixC' => 'required|string',
                    'choixD' => 'required|string',
                    'bonneReponse' => 'required|in:A,B,C,D',
                ]);
                $metadata = $qcmData;
                break;

            case 'TF':
                $tfData = $request->validate([
                    'bonneReponse' => 'required|in:A,B',
                ]);
                $metadata = [
                    'options' => [['label' => 'Vrai', 'value' => 'A'], ['label' => 'Faux', 'value' => 'B']],
                    'bonneReponse' => $tfData['bonneReponse']
                ];
                break;

            case 'FILL_IN':
                $fillInData = $request->validate([
                    'blanks' => 'required|array|min:1',
                    'blanks.*.accepted_answers' => 'required|array|min:1',
                    'blanks.*.accepted_answers.*' => 'string',
                    'case_sensitive' => 'boolean',
                ]);
                $metadata = [
                    'blanks' => $fillInData['blanks'],
                    'case_sensitive' => $fillInData['case_sensitive'] ?? false,
                ];
                break;
        }

        // 3. 执行更新
        $question->update([
            'type' => $type,
            'texte' => $baseData['texte'],
            'metadata' => $metadata,
            'explanation' => $baseData['explication'] ?? null,
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
        return response()->json(['message' => 'Question supprimÃ©e']);
    }

    /**
     * RECHERCHE
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $request->validate(['q' => 'required|string|min:2|max:100']);
            $term = $request->input('q');

            // 🎯 修复：去掉 Join，改用 whereHas 搜索关联表，防止字段污染
            $quizzes = Quiz::query()
                ->whereRaw('is_public IS TRUE')
                ->where(function ($query) use ($term) {
                    $query->whereRaw("search_vector @@ websearch_to_tsquery('french', ?)", [$term])
                        ->orWhere('titre', 'ILIKE', "%{$term}%")
                        ->orWhere('description', 'ILIKE', "%{$term}%")
                        // 🎯 优雅地搜索分类名
                        ->orWhereHas('categoryRelation', function($q) use ($term) {
                            $q->where('name', 'ILIKE', "%{$term}%");
                        })
                        ->orWhereRaw("similarity(titre, ?) > 0.3", [$term]);
                })
                ->orderByRaw("ts_rank(search_vector, websearch_to_tsquery('french', ?)) DESC", [$term])
                // 🎯 确保只选择 Quiz 表的字段
                ->select([
                    'id', 'titre', 'description', 'category_id',
                    'code_quiz', 'education_level', 'is_public', 'created_at',
                    'plays_count', 'image_path'
                ])
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
        // 🎯 修复：统一使用 categoryRelation 避免与可能存在的 category 字段冲突
        $quiz = Quiz::where('code_quiz', strtoupper($code))
            ->with(['categoryRelation:id,name']) // 只取需要的字段
            ->withCount('questions')
            ->first();

        if (!$quiz) {
            return response()->json(['error' => 'Quiz introuvable'], 404);
        }

        // 确保返回的是干净的 Quiz 模型数据
        return response()->json($quiz);
    }

    /**
     * ENREGISTRER RÃ‰SULTAT
     */
    public function storeResult(Request $request, Quiz $quiz): JsonResponse
    {
        $user = Auth::user();

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
     * MES RÃ‰SULTATS
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
            // ðŸŽ¯ FIX POSTGRES: whereRaw('is_public IS TRUE') pour Ã©viter boolean=integer
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
