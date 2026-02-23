<template>
  <div class="auth-callback">
    <div class="loading">
      <div class="spinner"></div>
      <p>Authentification en cours...</p>
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
        const accessToken = hashParams.get('access_token')

        if (!accessToken) {
          console.error('Pas de access_token')
          router.push('/connexion')
          return
        }

        const payload = JSON.parse(atob(accessToken.split('.')[1]))

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            access_token: accessToken,
            user: {
              id: payload.sub,
              email: payload.email,
              user_metadata: {
                name: payload.user_metadata?.full_name || payload.user_metadata?.name,
                avatar_url: payload.user_metadata?.avatar_url || payload.user_metadata?.picture
              }
            }
          })
        })

        if (!response.ok) {
          throw new Error('Erreur backend')
        }

        const data = await response.json()

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        if (data.needs_completion) {
          registrationStore.startGoogleFlow({
            email: data.user.email,
            supabaseId: data.user.supabase_id,
            avatar: data.user.avatar
          })
          router.push('/inscription')
        } else {
          if (data.user.role === 'TEACHER') {
            router.push('/enseignant')
          } else {
            router.push('/etudiant')
          }
        }

      } catch (error) {
        console.error('Erreur:', error)
        router.push('/connexion')
      }
    })

    return {}
  }
}
</script>

<style scoped>
.auth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
