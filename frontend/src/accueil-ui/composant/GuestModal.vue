<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const emit = defineEmits(['close']); // ← 'emit' est maintenant une variable utilisable dans le template

const goToRegister = () => {
  emit('close');
  router.push('/inscription');
};

const goToLogin = () => {
  emit('close');
  router.push('/connexion');
};

const close = () => emit('close'); // ← AJOUT : fonction wrapper pour le template
</script>

<template>
  <Teleport to="body">
    <div class="guest-modal-backdrop" @click.self="close">
      <div class="guest-modal-card">

        <button class="guest-modal-close" @click="close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="guest-modal-logo">
          <img src="/images/Black_BlitzzQuiz 1.svg" alt="BlitzzQuiz" />
        </div>

        <h2 class="guest-modal-title">Rejoins BlitzzQuiz</h2>
        <p class="guest-modal-subtitle">
          Crée un compte gratuit pour accéder à tous les quiz, suivre tes résultats et grimper dans le classement.
        </p>

        <div class="guest-modal-actions">
          <button class="btn btn-primary" @click="goToRegister">S'inscrire gratuitement</button>
          <button class="btn btn-secondary" @click="goToLogin">Se connecter</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* BACKDROP — flou + opacité */
.guest-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* CARD MODAL */
.guest-modal-card {
  position: relative;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.12);
  padding: 48px 48px 40px;
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: slideUp 0.25s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* CLOSE BTN */
.guest-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;
}
.guest-modal-close:hover { color: #1a1a1a; }

/* LOGO */
.guest-modal-logo {
  margin-bottom: 28px;
}
.guest-modal-logo img {
  width: clamp(140px, 30vw, 200px);
  height: auto;
}

/* TEXTES */
.guest-modal-title {
  font-family: 'Anton', sans-serif;
  font-size: 1.8rem;
  letter-spacing: 1px;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.guest-modal-subtitle {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.95rem;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.6;
  max-width: 340px;
  margin: 0 0 32px;
}

/* BOUTONS */
.guest-modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.guest-modal-actions .btn {
  width: 100%;
  padding: 14px 24px;
  border-radius: 6px;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.guest-modal-actions .btn-primary {
  background: #1a1a1a;
  color: #fff;
}
.guest-modal-actions .btn-primary:hover { background: #333; }

.guest-modal-actions .btn-secondary {
  background: transparent;
  color: #1a1a1a;
  border: 1px solid rgba(0, 0, 0, 0.15);
}
.guest-modal-actions .btn-secondary:hover {
  border-color: #1a1a1a;
  background: rgba(0, 0, 0, 0.03);
}

/* MOBILE */
@media (max-width: 768px) {
  .guest-modal-card {
    margin: 16px;
    padding: 36px 24px 28px;
  }
}
</style>
