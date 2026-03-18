<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { groupService } from '../../api/groups'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'

const router = useRouter()
const groupes = ref([])
const loading = ref(true)

const confirmModal = ref(false)
const groupeAQuitter = ref(null)
const leaving = ref(false)

const loadGroups = async () => {
  loading.value = true
  try {
    const { data } = await groupService.list() 
    groupes.value = data
  } catch (e) {
    console.error("Erreur chargement groupes", e)
  } finally {
    loading.value = false
  }
}

const goToGroup = (id) => {
  router.push(`/etudiant/groupes/${id}/quiz`)
}

const goHome = () => {
  router.push('/')
}

const ouvrirConfirmation = (e, groupe) => {
  e.stopPropagation()
  groupeAQuitter.value = groupe
  confirmModal.value = true
}

const annulerQuitter = () => {
  confirmModal.value = false
  groupeAQuitter.value = null
}

const confirmerQuitter = async () => {
  if (!groupeAQuitter.value) return
  leaving.value = true
  try {
    await groupService.leave(groupeAQuitter.value.id)
    groupes.value = groupes.value.filter(g => g.id !== groupeAQuitter.value.id)
    confirmModal.value = false
    groupeAQuitter.value = null
  } catch (e) {
    console.error("Erreur lors du départ du groupe", e)
  } finally {
    leaving.value = false
  }
}

onMounted(loadGroups)
</script>

<template>
  <div class="mes-groupes-page">
    <AppHeader />

    <div class="main-layout container-blitzz">
      <main class="content-area">

        <header class="header-text">
          <h1 class="anton-title">MES GROUPES</h1>
          <p class="count-text" v-if="!loading">{{ groupes.length }} CLASSES REJOINTES</p>
        </header>

        <div v-if="loading" class="loader">
          <div class="spinner"></div>
        </div>

        <div v-else-if="groupes.length > 0" class="group-grid">
          <div 
            v-for="g in groupes" 
            :key="g.id" 
            class="group-card-blitzz" 
            @click="goToGroup(g.id)"
          >
            <div class="card-icon">
              <span class="material-symbols-outlined">groups</span>
            </div>
            <div class="card-info">
              <h3>{{ g.nom }}</h3>
              <p>{{ g.nb_membres }} Membres</p>
            </div>
            <button class="btn-quitter" @click="ouvrirConfirmation($event, g)">
              <span class="material-symbols-outlined">logout</span>
              Quitter
            </button>
          </div>
        </div>

        <!-- Modale de confirmation -->
        <Transition name="modal-fade">
          <div v-if="confirmModal" class="modal-overlay" @click.self="annulerQuitter">
            <div class="modal-box">
              <div class="modal-icon">
                <span class="material-symbols-outlined">group_remove</span>
              </div>
              <h2 class="modal-title">Quitter le groupe ?</h2>
              <p class="modal-desc">
                Tu vas quitter <strong>{{ groupeAQuitter?.nom }}</strong>. 
                Tu pourras rejoindre à nouveau avec le code d'invitation.
              </p>
              <div class="modal-actions">
                <button class="modal-btn modal-btn--cancel" @click="annulerQuitter">
                  Annuler
                </button>
                <button class="modal-btn modal-btn--confirm" @click="confirmerQuitter" :disabled="leaving">
                  <span v-if="leaving" class="mini-spinner"></span>
                  <span v-else class="material-symbols-outlined">logout</span>
                  {{ leaving ? 'En cours...' : 'Quitter' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <div v-if="!loading && groupes.length === 0" class="empty-state">
          <span class="material-symbols-outlined icon">group_add</span>
          <h2>Aucun groupe</h2>
          <p>Utilise le bouton <strong>CODE</strong> en haut pour rejoindre ta première classe !</p>
        </div>
      </main>
    </div>

    <button class="fab-retour-accueil" @click="goHome">
      <span class="material-symbols-outlined">west</span>
      Retour à l'accueil
    </button>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;700;800&display=swap');

.mes-groupes-page {
  background: #fff;
  min-height: 100vh;
  padding-top: 130px;
  font-family: 'Inter', sans-serif;
  position: relative;
}

.main-layout {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px 100px;
}

/* 🎯 STYLE RECTANGULAIRE (PHOTO 2) */
.fab-retour-accueil {
  position: fixed;
  bottom: 40px;
  left: 40px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #111111; 
  color: #ffffff;
  border: none;
  /* 🎯 Changé de 50px à 8px pour le look rectangulaire */
  border-radius: 8px; 
  padding: 14px 24px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.fab-retour-accueil:hover {
  background: #00A3FF; 
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 163, 255, 0.3);
}

.fab-retour-accueil .material-symbols-outlined {
  font-size: 20px;
}

.anton-title {
  font-family: 'Anton', sans-serif;
  font-size: 4.5rem;
  line-height: 1;
  color: #1a1a1a;
  text-transform: uppercase;
  margin: 0;
}

.count-text {
  font-weight: 700;
  color: #9ca3af;
  margin-top: 10px;
  font-size: 0.9rem;
}

.group-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 50px;
}

.group-card-blitzz {
  background: #f9fafb;
  border: 2px solid #f3f4f6;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.group-card-blitzz:hover {
  border-color: #00A3FF;
  background: #fff;
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 163, 255, 0.1);
}

.card-icon {
  width: 56px;
  height: 56px;
  background: #111;
  color: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.card-info h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: #1a1a1a;
}

.card-info p {
  margin: 4px 0 0;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.9rem;
}

.btn-quitter {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background: #f9fafb;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
}

.btn-quitter .material-symbols-outlined {
  font-size: 18px;
}

.btn-quitter:hover {
  background: #111111;
  color: #ffffff;
  border-color: #111111;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* ── Modale ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-box {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 36px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
}

.modal-icon {
  width: 64px;
  height: 64px;
  background: #111111;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #ffffff;
}

.modal-icon .material-symbols-outlined {
  font-size: 30px;
}

.modal-title {
  font-family: 'Anton', sans-serif;
  font-size: 1.8rem;
  color: #1a1a1a;
  margin: 0 0 12px;
  text-transform: uppercase;
}

.modal-desc {
  color: #6b7280;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.5;
  margin: 0 0 28px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 20px;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
}

.modal-btn .material-symbols-outlined {
  font-size: 18px;
}

.modal-btn--cancel {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.modal-btn--cancel:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.modal-btn--confirm {
  background: #111111;
  color: #ffffff;
  border: 2px solid transparent;
}

.modal-btn--confirm:hover:not(:disabled) {
  background: #00A3FF;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 163, 255, 0.3);
}

.modal-btn--confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

/* ── Transitions modale ── */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-active .modal-box,
.modal-fade-leave-active .modal-box {
  transition: transform 0.25s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .modal-box,
.modal-fade-leave-to .modal-box {
  transform: scale(0.92) translateY(20px);
  opacity: 0;
}

.loader { display: flex; justify-content: center; padding: 100px 0; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top-color: #00A3FF; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 100px 0; color: #9ca3af; }
.empty-state .icon { font-size: 4rem; margin-bottom: 20px; }

@media (max-width: 768px) {
  .anton-title { font-size: 3rem; }

  .fab-retour-accueil {
    bottom: 20px;
    left: 20px;
    padding: 12px 20px;
    font-size: 0.85rem;
    border-radius: 8px;
  }

  .btn-quitter span.material-symbols-outlined {
    display: none;
  }

  .btn-quitter {
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  .modal-box {
    padding: 28px 20px;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
