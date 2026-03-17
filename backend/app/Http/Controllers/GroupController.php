<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\Assignment;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class GroupController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $groups = Group::where('owner_id', $user->id)
            ->orWhereHas('members', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->with(['owner', 'members'])
            ->get();

        $mapped = $groups->map(function ($g) {
            return [
                'id' => $g->id,
                'nom' => $g->nom,
                'owner_id' => $g->owner_id, // ✅ 别忘了这个，用来判断身份
                'code_invitation' => $g->code_invitation, // ✅ 补上这一行！
                'is_public' => $g->is_public,
                'nb_membres' => $g->members->count(),
            ];
        });

        return response()->json($mapped);
    }

    /**
     * Détails groupe (vérif membre ou owner).
     */
    public function show(Group $group)
    {
        $userId = Auth::id();

        $isOwner = ($userId === $group->owner_id);
        $isMember = $group->members()->where('user_id', $userId)->exists();

        if (!$isOwner && !$isMember) {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        $group->load(['owner', 'members']);

        return response()->json([
            'id' => $group->id,
            'nom' => $group->nom,
            'description' => $group->description,
            'is_public' => $group->is_public,
            'code_invitation' => $group->code_invitation,
            'members' => $group->members,
            'nb_membres' => $group->members->count(),
            'assignments' => [],
            'owner_id' => $group->owner_id

        ]);
    }

    /**
     * Créer groupe (enseignant/owner).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'is_public' => 'boolean',
        ]);

        $isPublic = $validated['is_public'] ?? true;

        $userID = Auth::id();

        $group = Group::create([

            'nom' => $validated['nom'],
            'code_invitation' => Str::upper(Str::random(6)), // 3 lettres + 3 chiffres possible plus tard
            'is_public' => $isPublic,
            'owner_id' => Auth::id(),
            'description' => $validated['description'] ?? null,
        ]);

        $group->members()->attach($userID);
        $group->load('owner');
        return response()->json($group, 201);
    }

    /**
     * Mettre à jour groupe (seul owner).
     */
    public function update(Request $request, Group $group)
    {
        if (Auth::id() !== $group->owner_id) {
            return response()->json(['error' => 'Seul l\'owner peut modifier'], 403);
        }

        $validated = $request->validate([
            'nom' => 'string|max:100',
            'is_public' => 'boolean',
        ]);

        if (array_key_exists('is_public', $validated)) {
            $group->is_public = $validated['is_public'];
        }

        if (array_key_exists('nom', $validated)) {
            $group->nom = $validated['nom'];
        }

        $group->save();

        $group->load(['owner', 'members']);

        return response()->json($group);
    }

    /**
     * Supprimer groupe (seul owner).
     */
    public function destroy(Group $group)
    {
        if (Auth::id() != $group->owner_id) {
            return response()->json(['error' => 'Seul l\'owner peut supprimer'], 403);
        }

        $group->members()->detach();
        $group->delete();

        return response()->json(['message' => 'Groupe supprimé']);
    }

    /**
     * Rejoindre via code (élève).
     */
    public function join(Request $request)
    {
        $userId = Auth::id();
        $validated = $request->validate([
            'code_invitation' => 'required|string|size:6'
        ]);

        $code = strtoupper($validated['code_invitation']);

        $group = Group::where('code_invitation', $code)->first();

        if (!$group) {
            return response()->json(['error' => 'Code invalide'], 404);
        }

        if ($group->members()->where('user_id', $userId)->exists()) {
            return response()->json(['error' => 'Déjà membre'], 409);
        }

        // user_groups (user_id, group_id)
        $group->members()->attach($userId);

        return response()->json([
            'message' => 'Tu as rejoint le groupe',
            'id' => $group->id,
            'nom' => $group->nom,
        ]);
    }

    /**
     * Associer un quiz à un groupe (enseignant owner).
     * Insère une ligne dans la table assignments.
     */
    public function assignQuiz(Request $request, Group $group)
    {
        // Seul le propriétaire du groupe peut associer des quiz
        if (Auth::id() !== $group->owner_id) {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        $validated = $request->validate([
            'quiz_id' => 'required|exists:quizzes,id',
        ]);

        $quizId = (int) $validated['quiz_id'];

        // Crée l'assignation si elle n'existe pas encore
        $assignment = Assignment::firstOrCreate(
            [
                'quiz_id' => $quizId,
                'group_id' => $group->id,
            ],
            [
                'assigned_at' => now(),
            ]
        );

        return response()->json([
            'quizId' => $assignment->quiz_id,
            'statut' => 'actif',
            'dateAssignation' => $assignment->assigned_at,
        ], 201);
    }

    /**
     * Retirer un quiz assigné d'un groupe (enseignant owner).
     */
    public function unassignQuiz(Group $group, Quiz $quiz)
    {
        if (Auth::id() !== $group->owner_id) {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        Assignment::where('group_id', $group->id)
            ->where('quiz_id', $quiz->id)
            ->delete();

        return response()->json(['message' => 'Quiz retiré du groupe']);
    }

    /**
     * Liste des quiz assignés au groupe (accès membre ou owner).
     */
    public function quizzes(Group $group)
    {
        $userId = Auth::id();
        $isOwner = ($userId === $group->owner_id);
        $isMember = $group->members()->where('user_id', $userId)->exists();

        if (!$isOwner && !$isMember) {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        // 🎯 关键改动：预加载 categoryRelation
        // 只有加载了它，模型里的 $quiz->category 访问器才能拿到分类名字
        $assignments = $group->assignments()->with([
            'quiz' => fn ($q) => $q->with(['categoryRelation'])->withCount('questions')
        ])->get();

        $quizzes = $assignments->map(function ($a) {
            $quiz = $a->quiz;
            if (!$quiz) return null;

            return [
                'id' => $quiz->id,
                'titre' => $quiz->titre,
                'category' => $quiz->category,
                'questions_count' => $quiz->questions_count ?? 0,
                'is_public' => (bool)$quiz->is_public,
                'code_quiz' => $quiz->code_quiz,
                'description' => $quiz->description,
                'plays_count' => $quiz->plays_count ?? 0,
                'is_recommended' => false,
            ];
        })->filter()->values();

        return response()->json($quizzes);
    }

    /**
     * Inviter un membre par email (owner seulement).
     * Cherche l'utilisateur par email, l'ajoute au groupe (table user_groups).
     */
    public function inviteByEmail(Request $request, Group $group)
    {
        if (Auth::id() !== $group->owner_id) {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json(['error' => 'Aucun utilisateur trouvé avec cet email'], 404);
        }

        if ($group->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['error' => 'Cette personne est déjà membre du groupe'], 409);
        }

        $group->members()->attach($user->id);

        return response()->json([
            'message' => 'Membre ajouté au groupe',
            'member' => [
                'id' => $user->id,
                'nickname' => $user->nickname,
                'email' => $user->email,
            ],
        ], 201);
    }

    /**
     * Ajouter membre spécifique (owner seulement).
     */
    public function addMember(Request $request, Group $group)
    {
        if (Auth::id() !== $group->owner_id) {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|different:owner_id',
        ]);

        if ($group->members()->where('user_id', $validated['user_id'])->exists()) {
            return response()->json(['error' => 'Déjà membre'], 409);
        }

        $group->members()->attach($validated['user_id']);

        return response()->json(['message' => 'Membre ajouté']);
    }

    /**
     * Quitter groupe.
     */
    public function leave(Group $group)
    {
        $group->members()->detach(Auth::id());

        return response()->json(['message' => 'Groupe quitté']);
    }
    public function getQuizzes($id)
    {
        try {
            // 1. On récupère le groupe avec ses assignments et les quiz reliés
            // On charge aussi les catégories et le compte des questions en une seule fois (Eager Loading)
            $group = Group::with(['assignments.quiz.category', 'assignments.quiz.questions'])
                ->findOrFail($id);

            // 2. Vérification de sécurité (Owner ou Membre)
            $userId = Auth::id();
            if ($userId !== $group->owner_id && !$group->members()->where('user_id', $userId)->exists()) {
                return response()->json(['error' => 'Accès refusé'], 403);
            }

            // 3. On extrait uniquement les Quiz des Assignments
            $quizzes = $group->assignments->map(function ($assignment) {
                $quiz = $assignment->quiz;
                if ($quiz) {
                    // On injecte les infos nécessaires pour le Web et le Mobile
                    $quiz->questions_count = $quiz->questions->count();
                    // On garde l'id de l'assignment au cas où le mobile en ait besoin plus tard
                    $quiz->current_assignment_id = $assignment->id;
                }
                return $quiz;
            })->filter()->values(); // values() pour remettre les index de l'array à zéro

            // 🎯 On renvoie un tableau d'objets Quiz.
            // C'est la structure la plus standard pour un endpoint qui finit par /quizzes
            return response()->json($quizzes);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors du chargement des quiz',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Classement
     */
    public function quizRanking(Group $group, \App\Models\Quiz $quiz)
    {
        $userId = Auth::id();

        // 1. 权限鉴定：只有 Owner 和 Member 可以看排名
        $isOwner = ($userId === $group->owner_id);
        $isMember = $group->members()->where('user_id', $userId)->exists();

        if (!$isOwner && !$isMember) {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        // 2. 收集有资格参与排名的人员名单（群成员 + 也许还有群主）
        $memberIds = $group->members()->pluck('users.id')->push($group->owner_id)->unique();

        // 3. 查询 Result 表，获取最高分排名
        // 假设你的 Result 模型里有 public function user() 关联
        $results = \App\Models\Result::with('user:id,nickname,avatar')
            ->where('quiz_id', $quiz->id)
            ->whereIn('user_id', $memberIds)
            ->get();

        // 4. 数据清洗：如果学生可以多次答题，我们只取他分数最高的那一次作为排名依据
        $ranking = $results->groupBy('user_id')->map(function ($userResults) {
            // 选出该用户分数最高的那条记录
            return $userResults->sortByDesc('score')->first();
        })
        ->sortByDesc('score') // 全局按最高分降序
        ->values(); // 重置数组索引

        return response()->json($ranking);
    }

}
