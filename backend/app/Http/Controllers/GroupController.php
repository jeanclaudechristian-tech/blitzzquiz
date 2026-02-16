<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class GroupController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum'); // ou 'jwt.auth'
        $this->middleware('role:enseignant|admin')->except(['index', 'show', 'join']); // Seul owner/enseignant crée/gère
    }

    /**
     * Liste des groupes (utilisateur connecté : owned + membre).
     */
    public function index()
    {
        $user = Auth::user();
        $groups = Group::where('owner_id', $user->id)
            ->orWhereHas('members', fn($q) => $q->where('user_id', $user->id))
            ->with(['owner:id,name', 'members:id,name', 'assignments:id'])
            ->paginate(10);

        return response()->json($groups);
    }

    /**
     * Détails groupe (vérif membre ou owner).
     */
    public function show(Group $group)
    {
        if (!Auth::user()->id === $group->owner_id || !$group->members()->where('user_id', Auth::id())->exists()) {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        $group->load(['owner:id,name', 'members:id,name', 'assignments.quiz']);

        return response()->json($group);
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

        $group = Group::create([
            'nom' => $validated['nom'],
            'code_invitation' => $validated['is_public'] ? null : Str::upper(Str::random(6)),
            'is_public' => $validated['is_public'] ?? false,
            'owner_id' => Auth::id(),
        ]);

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

        $group->update(array_merge($validated, [
            'code_invitation' => $validated['is_public'] ? null : Str::upper(Str::random(6))
        ]));

        $group->load(['owner', 'members']);

        return response()->json($group);
    }

    /**
     * Supprimer groupe (seul owner).
     */
    public function destroy(Group $group)
    {
        if (Auth::id() !== $group->owner_id) {
            return response()->json(['error' => 'Seul l\'owner peut supprimer'], 403);
        }

        $group->delete();

        return response()->json(['message' => 'Groupe supprimé']);
    }

    /**
     * Rejoindre via code (public ou code).
     */
    public function join(Request $request)
    {
        $validated = $request->validate([
            'code_invitation' => 'required|string|size:6|upper'
        ]);

        $group = Group::where('code_invitation', $validated['code_invitation'])->first();

        if (!$group || !$group->is_public && $group->code_invitation !== $validated['code_invitation']) {
            return response()->json(['error' => 'Code invalide ou groupe privé'], 404);
        }

        if ($group->members()->where('user_id', Auth::id())->exists()) {
            return response()->json(['error' => 'Déjà membre'], 409);
        }

        $group->members()->attach(Auth::id());

        $group->load(['owner:id,name', 'members:id,name']);

        return response()->json($group);
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
