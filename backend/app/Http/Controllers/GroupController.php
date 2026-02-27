<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Group;
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

        $group -> members()->attach($userID);
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

        $group = \App\Models\Group::where('code_invitation', $code)->first();

        if (!$group) {
            return response()->json(['error' => 'Code invalide ou groupe privé'], 404);
        }

        if ($group->members()->where('user_id', $userId)->exists()) {
            return response()->json(['error' => 'Déjà membre'], 409);
        }

        // user_groups (user_id, group_id)
        $group->members()->attach($userId);

        // 建议返回和 index 一致的结构，确保前端解析不出错
        return response()->json([
            'id' => $group->id,
            'nom' => $group->nom,
            'owner_id' => $group->owner_id,
            'code_invitation' => $group->code_invitation,
            'is_public' => $group->is_public,
            'nb_membres' => $group->members()->count(), // 实时计算人数
        ]);
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
            'user_id' => 'required|exists:users,id|different:owner_id'
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
}
