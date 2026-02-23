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
import { supabase } from '@/lib/supabase'

export default {
  name: 'AuthCallback',
  setup() {
    const router = useRouter()

    onMounted(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error)
          router.push('/connexion')
          return
        }

        if (session) {
          const user = session.user
          
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/callback`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({
                supabase_id: user.id,
                email: user.email,
                name: user.user_metadata.full_name || user.user_metadata.name,
                avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture
              })
            })

            if (!response.ok) {
              throw new Error('Erreur lors de la synchronisation avec le backend')
            }

            const data = await response.json()
            
            if (data.user && data.user.education_level) {
              router.push('/dashboard')
            } else {
              router.push('/inscription-2')
            }
          } catch (error) {
            console.error('Erreur backend:', error)
            router.push('/inscription-2')
          }
        } else {
          router.push('/connexion')
        }
      } catch (error) {
        console.error('Erreur inattendue:', error)
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

.loading p {
  font-size: 18px;
  font-weight: 500;
}
</style>
