<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api/Axios';
import AppHeader from '../../accueil-ui/composant/AppHeader.vue';
import { groupService } from '../../api/groups';

const route = useRoute();
const router = useRouter();

const groupe = ref(null);
const allQuizzes = ref([]);
const assignedQuizzes = ref([]);
const selectedQuizId = ref('');
const selectedResultQuizId = ref('');
const rankingRows = ref([]);
const rankingLoading = ref(false);
const rankingError = ref('');
const codeCopied = ref(false);
const showDeleteModal = ref(false);
const showInviteModal = ref(false);
const inviteEmail = ref('');
const loading = ref(true);
const pageError = ref('');
const inviteError = ref('');
const actionError = ref('');
const actionLoading = ref(false);

const currentUserId = computed(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.id ?? null;
});

const memberRows = computed(() => {
    if (!groupe.value) return [];

    return groupe.value.members.map((member) => ({
        id: member.id,
        displayName:
            member.nickname ||
            member.username ||
            member.name ||
            member.email?.split('@')[0] ||
            'Membre',
        email: member.email || 'Courriel indisponible',
        isOwner: member.id === groupe.value.ownerId,
        isCurrentUser: member.id === currentUserId.value
    }));
});

const availableQuizzes = computed(() => {
    const assignedIds = new Set(assignedQuizzes.value.map((quiz) => quiz.id));
    return allQuizzes.value.filter((quiz) => !assignedIds.has(quiz.id));
});

const selectedResultQuiz = computed(() =>
    assignedQuizzes.value.find((quiz) => String(quiz.id) === String(selectedResultQuizId.value)) || null
);

const resultRows = computed(() => {
    const rankingByUser = new Map(
        rankingRows.value.map((row) => [
            Number(row.user_id || row.user?.id),
            {
                score: Number(row.score ?? 0),
                attemptsCount: Number(row.attempts_count ?? 1),
                date: row.date_tentative || row.created_at || null
            }
        ])
    );

    return memberRows.value
        .map((member) => {
            const result = rankingByUser.get(Number(member.id));
            return {
                ...member,
                score: result ? result.score : null,
                attemptsCount: result ? result.attemptsCount : 0,
                date: result?.date || null
            };
        })
        .sort((a, b) => {
            const scoreA = a.score ?? -1;
            const scoreB = b.score ?? -1;
            if (scoreA !== scoreB) return scoreB - scoreA;
            return a.displayName.localeCompare(b.displayName, 'fr', { sensitivity: 'base' });
        });
});

const syncResultQuizSelection = () => {
    if (!assignedQuizzes.value.length) {
        selectedResultQuizId.value = '';
        rankingRows.value = [];
        rankingError.value = '';
        return;
    }

    const assignedIds = new Set(assignedQuizzes.value.map((quiz) => String(quiz.id)));
    if (!assignedIds.has(String(selectedResultQuizId.value))) {
        selectedResultQuizId.value = String(assignedQuizzes.value[0].id);
    }
};

const loadQuizRanking = async (quizId) => {
    if (!groupe.value || !quizId) return;

    rankingLoading.value = true;
    rankingError.value = '';

    try {
        const { data } = await groupService.getQuizRanking(groupe.value.id, quizId);
        rankingRows.value = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Erreur chargement resultats groupe', error.response?.data || error);
        rankingRows.value = [];
        rankingError.value =
            error.response?.data?.error || 'Impossible de charger les resultats pour ce quiz.';
    } finally {
        rankingLoading.value = false;
    }
};

const formatResultDate = (value) => {
    if (!value) return 'Aucune tentative';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Date indisponible';
    return parsed.toLocaleDateString('fr-CA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const scoreClass = (score) => {
    if (score === null) return 'result-score--none';
    if (score >= 80) return 'result-score--excellent';
    if (score >= 60) return 'result-score--good';
    return 'result-score--low';
};

const loadGroup = async () => {
    const { data } = await groupService.show(route.params.id);

    groupe.value = {
        id: data.id,
        nom: data.nom,
        description: data.description || '',
        isPublic: Boolean(data.is_public),
        code: data.code_invitation,
        ownerId: data.owner_id,
        members: Array.isArray(data.members) ? data.members : []
    };
};

const loadAssignedQuizzes = async () => {
    const { data } = await groupService.getQuizzes(route.params.id);
    const raw = Array.isArray(data) ? data : [];

    assignedQuizzes.value = raw.map((quiz) => ({
        id: quiz.id,
        titre: quiz.titre,
        questionsCount: quiz.questions_count ?? 0,
        isPublic: Boolean(quiz.is_public)
    }));

    syncResultQuizSelection();
};

const loadAllQuizzes = async () => {
    const userId = currentUserId.value;
    const { data } = await api.get('/quizzes');

    allQuizzes.value = data
        .filter((quiz) => !userId || quiz.owner_id === userId)
        .map((quiz) => ({
            id: quiz.id,
            titre: quiz.titre,
            questionsCount: quiz.questions_count ?? 0
        }));
};

const loadPage = async () => {
    loading.value = true;
    pageError.value = '';
    actionError.value = '';

    try {
        await Promise.all([loadGroup(), loadAssignedQuizzes(), loadAllQuizzes()]);
        syncResultQuizSelection();
        if (selectedResultQuizId.value) {
            await loadQuizRanking(selectedResultQuizId.value);
        }
    } catch (error) {
        console.error('Erreur chargement groupe', error.response?.data || error);
        pageError.value = 'Impossible de charger les details du groupe.';
    } finally {
        loading.value = false;
    }
};

const copyCode = async () => {
    if (!groupe.value?.code) return;

    await navigator.clipboard.writeText(groupe.value.code);
    codeCopied.value = true;
    setTimeout(() => {
        codeCopied.value = false;
    }, 1600);
};

const toggleVisibility = async () => {
    if (!groupe.value || actionLoading.value) return;

    actionError.value = '';
    actionLoading.value = true;

    try {
        const { data } = await groupService.update(groupe.value.id, {
            is_public: !groupe.value.isPublic
        });
        groupe.value.isPublic = Boolean(data.is_public);
        groupe.value.code = data.code_invitation ?? groupe.value.code;
    } catch (error) {
        console.error('Erreur changement visibilite', error.response?.data || error);
        actionError.value = 'Impossible de modifier la visibilite du groupe.';
    } finally {
        actionLoading.value = false;
    }
};

const assignQuiz = async () => {
    if (!selectedQuizId.value || !groupe.value || actionLoading.value) return;

    actionError.value = '';
    actionLoading.value = true;

    try {
        await groupService.assignQuizToGroup(groupe.value.id, selectedQuizId.value);
        selectedQuizId.value = '';
        await loadAssignedQuizzes();
        if (selectedResultQuizId.value) {
            await loadQuizRanking(selectedResultQuizId.value);
        }
    } catch (error) {
        console.error('Erreur association quiz', error.response?.data || error);
        actionError.value = 'Impossible d associer ce quiz au groupe.';
    } finally {
        actionLoading.value = false;
    }
};

const removeQuiz = async (quizId) => {
    if (!groupe.value || actionLoading.value) return;
    if (!confirm('Retirer ce quiz du groupe ?')) return;

    actionError.value = '';
    actionLoading.value = true;

    try {
        await groupService.removeQuizFromGroup(groupe.value.id, quizId);
        await loadAssignedQuizzes();
        if (selectedResultQuizId.value) {
            await loadQuizRanking(selectedResultQuizId.value);
        }
    } catch (error) {
        console.error('Erreur retrait quiz', error.response?.data || error);
        actionError.value = 'Impossible de retirer ce quiz du groupe.';
    } finally {
        actionLoading.value = false;
    }
};

const removeMember = async (member) => {
    if (!groupe.value || member.isOwner || actionLoading.value) return;
    if (!confirm(`Retirer ${member.displayName} du groupe ?`)) return;

    actionError.value = '';
    actionLoading.value = true;

    try {
        await groupService.removeMember(groupe.value.id, member.id);
        groupe.value.members = groupe.value.members.filter((item) => item.id !== member.id);
    } catch (error) {
        console.error('Erreur retrait membre', error.response?.data || error);
        actionError.value =
            error.response?.data?.error || 'Impossible de retirer ce membre du groupe.';
    } finally {
        actionLoading.value = false;
    }
};

const inviteMember = async () => {
    if (!groupe.value || actionLoading.value) return;
    if (!inviteEmail.value.trim()) {
        inviteError.value = 'Entre un courriel valide.';
        return;
    }

    inviteError.value = '';
    actionLoading.value = true;

    try {
        await groupService.inviteMemberByEmail(groupe.value.id, inviteEmail.value.trim());
        inviteEmail.value = '';
        showInviteModal.value = false;
        await loadGroup();
    } catch (error) {
        console.error('Erreur invitation membre', error.response?.data || error);
        inviteError.value =
            error.response?.data?.error || 'Impossible d inviter ce membre.';
    } finally {
        actionLoading.value = false;
    }
};

const confirmDelete = async () => {
    if (!groupe.value || actionLoading.value) return;
    actionLoading.value = true;

    try {
        await groupService.destroy(groupe.value.id);
        router.push('/enseignant/groupes');
    } catch (error) {
        console.error('Erreur suppression groupe', error.response?.data || error);
        actionError.value = 'Impossible de supprimer le groupe.';
        showDeleteModal.value = false;
    } finally {
        actionLoading.value = false;
    }
};

const goBack = () => {
    router.push('/enseignant/groupes');
};

const goToCreate = () => {
    router.push({ path: '/enseignant', query: { mode: 'groupe' } });
};

watch(selectedResultQuizId, async (quizId) => {
    if (!quizId) {
        rankingRows.value = [];
        rankingError.value = '';
        return;
    }

    await loadQuizRanking(quizId);
});

onMounted(loadPage);
</script>

<template>
    <div class="teacher-group-detail-page">
        <AppHeader />

        <main v-if="groupe && !loading && !pageError" class="teacher-group-detail-main">
            <section class="detail-hero">
                <div class="detail-hero-copy">
                    <button type="button" class="back-button" @click="goBack">
                        <span class="material-symbols-outlined">west</span>
                        Mes groupes
                    </button>

                    <div class="hero-badges">
                        <span class="hero-pill" :class="{ 'hero-pill--private': !groupe.isPublic }">
                            {{ groupe.isPublic ? 'Public' : 'Prive' }}
                        </span>
                        <button type="button" class="hero-code" @click="copyCode">
                            {{ codeCopied ? 'Code copie' : `Code ${groupe.code}` }}
                        </button>
                    </div>

                    <h1>{{ groupe.nom }}</h1>
                    <p>
                        {{
                            groupe.description ||
                                'Gere les membres et les quiz de ce groupe.'
                        }}
                    </p>

                    <div class="hero-stats">
                        <div class="hero-stat">
                            <span>Membres</span>
                            <strong>{{ memberRows.length }}</strong>
                        </div>
                        <div class="hero-stat">
                            <span>Quiz assignes</span>
                            <strong>{{ assignedQuizzes.length }}</strong>
                        </div>
                    </div>
                </div>

                <aside class="detail-hero-actions">
                    <button
                        type="button"
                        class="hero-action hero-action--primary"
                        :disabled="actionLoading"
                        @click="showInviteModal = true"
                    >
                        Inviter un membre
                    </button>
                    <button type="button" class="hero-action" :disabled="actionLoading" @click="toggleVisibility">
                        Rendre {{ groupe.isPublic ? 'prive' : 'public' }}
                    </button>
                    <button type="button" class="hero-action" :disabled="actionLoading" @click="goToCreate">
                        Nouveau groupe
                    </button>
                    <button
                        type="button"
                        class="hero-action hero-action--danger"
                        :disabled="actionLoading"
                        @click="showDeleteModal = true"
                    >
                        Supprimer le groupe
                    </button>
                </aside>
            </section>

            <p v-if="actionError" class="action-error">{{ actionError }}</p>

            <section class="detail-grid">
                <article class="detail-card">
                    <header class="detail-card-head">
                        <div>
                            <p class="detail-card-kicker">Membres</p>
                            <h2>{{ memberRows.length }} participant(s)</h2>
                        </div>
                        <button type="button" class="mini-action" @click="showInviteModal = true">
                            Ajouter
                        </button>
                    </header>

                    <div class="member-list">
                        <div v-for="member in memberRows" :key="member.id" class="member-row">
                            <div class="member-main">
                                <strong>{{ member.displayName }}</strong>
                                <span>{{ member.email }}</span>
                            </div>

                            <div class="member-side">
                                <span class="member-badge" :class="{ 'member-badge--owner': member.isOwner }">
                                    {{ member.isOwner ? 'Owner' : member.isCurrentUser ? 'Vous' : 'Membre' }}
                                </span>
                                <button
                                    v-if="!member.isOwner"
                                    type="button"
                                    class="remove-button"
                                    :disabled="actionLoading"
                                    @click="removeMember(member)"
                                >
                                    Retirer
                                </button>
                            </div>
                        </div>
                    </div>
                </article>

                <article class="detail-card">
                    <header class="detail-card-head">
                        <div>
                            <p class="detail-card-kicker">Quiz</p>
                            <h2>Quiz assignes au groupe</h2>
                        </div>
                    </header>

                    <div class="assign-bar">
                        <select v-model="selectedQuizId" class="quiz-select">
                            <option value="">Choisir un quiz</option>
                            <option v-for="quiz in availableQuizzes" :key="quiz.id" :value="quiz.id">
                                {{ quiz.titre }} ({{ quiz.questionsCount }} questions)
                            </option>
                        </select>

                        <button
                            type="button"
                            class="mini-action mini-action--solid"
                            :disabled="!selectedQuizId || actionLoading"
                            @click="assignQuiz"
                        >
                            Associer
                        </button>
                    </div>

                    <div v-if="assignedQuizzes.length" class="quiz-list">
                        <div v-for="quiz in assignedQuizzes" :key="quiz.id" class="quiz-row">
                            <div class="quiz-main">
                                <strong>{{ quiz.titre }}</strong>
                                <span>
                                    {{ quiz.questionsCount }} question(s) ·
                                    {{ quiz.isPublic ? 'Public' : 'Prive' }}
                                </span>
                            </div>

                            <button type="button" class="remove-button" :disabled="actionLoading" @click="removeQuiz(quiz.id)">
                                Retirer
                            </button>
                        </div>
                    </div>

                    <p v-else class="empty-copy">Aucun quiz n est encore associe a ce groupe.</p>
                </article>

                <article class="detail-card detail-card--results">
                    <header class="detail-card-head">
                        <div>
                            <p class="detail-card-kicker">Resultats</p>
                            <h2>Notes des membres par quiz</h2>
                        </div>
                    </header>

                    <p v-if="!assignedQuizzes.length" class="empty-copy">
                        Associe d abord un quiz au groupe pour voir les notes.
                    </p>

                    <template v-else>
                        <div class="assign-bar">
                            <select v-model="selectedResultQuizId" class="quiz-select">
                                <option disabled value="">Choisir un quiz assigne</option>
                                <option v-for="quiz in assignedQuizzes" :key="quiz.id" :value="String(quiz.id)">
                                    {{ quiz.titre }} ({{ quiz.questionsCount }} questions)
                                </option>
                            </select>
                            <div class="results-meta">
                                {{ selectedResultQuiz ? `${selectedResultQuiz.questionsCount} question(s)` : '--' }}
                            </div>
                        </div>

                        <p v-if="rankingError" class="action-error">{{ rankingError }}</p>
                        <p v-else-if="rankingLoading" class="empty-copy">Chargement des resultats...</p>

                        <div v-else class="results-list">
                            <div v-for="(row, index) in resultRows" :key="row.id" class="result-row">
                                <div class="result-rank">
                                    <strong>{{ row.score === null ? '--' : `#${index + 1}` }}</strong>
                                </div>

                                <div class="result-member">
                                    <strong>{{ row.displayName }}</strong>
                                    <span>{{ row.email }}</span>
                                </div>

                                <div class="result-score-wrap">
                                    <strong :class="['result-score', scoreClass(row.score)]">
                                        {{ row.score === null ? 'Aucune tentative' : `${row.score}%` }}
                                    </strong>
                                    <span class="result-meta">
                                        {{
                                            row.score === null
                                                ? 'Pas encore de note'
                                                : `${row.attemptsCount} tentative(s) · ${formatResultDate(row.date)}`
                                        }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </template>
                </article>
            </section>
        </main>

        <div v-else-if="loading" class="detail-loading">
            <div class="spinner"></div>
        </div>
        <div v-else class="detail-loading detail-error-wrap">
            <div class="detail-error-card">
                <h2>Chargement impossible</h2>
                <p>{{ pageError || 'Impossible de charger cette page.' }}</p>
                <div class="detail-error-actions">
                    <button type="button" class="modal-btn modal-btn--primary" @click="loadPage">
                        Réessayer
                    </button>
                    <button type="button" class="modal-btn" @click="goBack">
                        Mes groupes
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showInviteModal" class="modal-overlay" @click.self="showInviteModal = false">
            <div class="modal-card">
                <h3>Inviter un membre</h3>
                <p>Entre le courriel de l utilisateur a ajouter a ce groupe.</p>
                <input v-model="inviteEmail" type="email" class="modal-input" placeholder="exemple@email.com" />
                <p v-if="inviteError" class="modal-error">{{ inviteError }}</p>
                <div class="modal-actions">
                    <button type="button" class="modal-btn" @click="showInviteModal = false">
                        Annuler
                    </button>
                    <button type="button" class="modal-btn modal-btn--primary" :disabled="actionLoading" @click="inviteMember">
                        {{ actionLoading ? 'Envoi...' : 'Envoyer' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
            <div class="modal-card">
                <h3>Supprimer ce groupe ?</h3>
                <p>Cette action supprime le groupe et retire aussi ses membres.</p>
                <div class="modal-actions">
                    <button type="button" class="modal-btn" @click="showDeleteModal = false">
                        Annuler
                    </button>
                    <button type="button" class="modal-btn modal-btn--danger" :disabled="actionLoading" @click="confirmDelete">
                        {{ actionLoading ? 'Suppression...' : 'Supprimer' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import './GroupeDetailsPage.css';
</style>
