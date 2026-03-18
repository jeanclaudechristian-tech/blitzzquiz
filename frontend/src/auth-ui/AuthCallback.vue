<template>
  <div class="auth-callback">
    <div class="callback-card">
      <div class="bolt-shell" aria-hidden="true">
        <span class="pulse-ring pulse-ring-1"></span>
        <span class="pulse-ring pulse-ring-2"></span>
        <span class="pulse-ring pulse-ring-3"></span>
        <img src="/images/Eclaire.svg" alt="" class="bolt-icon" />
      </div>

      <h1 class="callback-title">Connexion Google sécurisée</h1>
      <p class="callback-subtitle">Validation de votre compte en cours...</p>

      <div class="progress-track" aria-hidden="true">
        <div class="progress-fill"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '../stores/registration'

export default {
  name: 'AuthCallback',
  setup() {
    const router = useRouter()
    const registrationStore = useRegistrationStore()

    onMounted(async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const idToken = hashParams.get('id_token')

        if (!idToken) {
          router.push('/connexion')
          return
        }

        window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`)

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: idToken })
        })

        if (!response.ok) {
          throw new Error('Erreur backend')
        }

        const data = await response.json()

        const userData = {
          ...data.user,
          is_super: data.is_super,
          role: data.role
        }

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(userData))

        if (data.needs_completion) {
          registrationStore.startGoogleFlow({
            google_id: data.user.google_id,
            email: data.user.email,
            avatar: data.user.avatar
          })
          router.push('/inscription')
          return
        }

        router.push('/')
      } catch (error) {
        console.error('Erreur callback Google:', error)
        router.push('/connexion')
      }
    })

    return {}
  }
}
</script>

<style scoped>
.auth-callback {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 12% 12%, rgba(80, 202, 255, 0.2), transparent 42%),
    radial-gradient(circle at 86% 85%, rgba(36, 32, 29, 0.1), transparent 36%),
    #f6feff;
}

.callback-card {
  width: min(460px, 100%);
  background: #ffffff;
  border: 1px solid rgba(80, 202, 255, 0.35);
  border-radius: 22px;
  box-shadow: 0 20px 45px rgba(36, 32, 29, 0.09);
  padding: 34px 28px 30px;
  text-align: center;
}

.bolt-shell {
  position: relative;
  width: 110px;
  height: 110px;
  margin: 0 auto 16px;
  display: grid;
  place-items: center;
}

.pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  border: 2px solid rgba(80, 202, 255, 0.45);
  opacity: 0;
  animation: pulse 2.1s ease-out infinite;
}

.pulse-ring-2 {
  animation-delay: 0.7s;
}

.pulse-ring-3 {
  animation-delay: 1.4s;
}

.bolt-icon {
  width: 30px;
  height: auto;
  filter: drop-shadow(0 8px 15px rgba(80, 202, 255, 0.35));
  animation: bolt-breath 1.35s ease-in-out infinite;
}

.callback-title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: clamp(24px, 4.2vw, 32px);
  color: #24201d;
  line-height: 1.15;
}

.callback-subtitle {
  margin: 12px 0 18px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #4f4f4f;
}

.progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: rgba(80, 202, 255, 0.18);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 40%;
  border-radius: inherit;
  background: linear-gradient(90deg, #50caff 0%, #2aa9df 100%);
  animation: progress-slide 1.6s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.55);
    opacity: 0;
  }
  30% {
    opacity: 0.85;
  }
  100% {
    transform: scale(1.08);
    opacity: 0;
  }
}

@keyframes bolt-breath {
  0%, 100% {
    transform: scale(0.95);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}

@keyframes progress-slide {
  0% {
    transform: translateX(-90%);
  }
  100% {
    transform: translateX(260%);
  }
}

@media (max-width: 768px) {
  .callback-card {
    border-radius: 18px;
    padding: 28px 20px 24px;
  }

  .bolt-shell {
    width: 92px;
    height: 92px;
    margin-bottom: 14px;
  }

  .bolt-icon {
    width: 26px;
  }

  .callback-subtitle {
    font-size: 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pulse-ring,
  .bolt-icon,
  .progress-fill {
    animation: none;
  }
}
</style>
