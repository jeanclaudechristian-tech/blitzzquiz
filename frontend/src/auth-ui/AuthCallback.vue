<template>
  <div class="auth-callback-container">
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Authentification en cours...</p>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../lib/supabaseClient'

export default {
  name: 'AuthCallback',
  setup() {
    const router = useRouter();

    onMounted(async () => {
      try {
        // Récupérer les tokens du hash URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          // Établir la session avec les tokens
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) throw error;

          if (session) {
            // Vérifier si l'utilisateur existe dans ta base de données backend
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/callback`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({
                access_token: accessToken,
                refresh_token: refreshToken,
                user: session.user
              })
            });

            const data = await response.json();

            if (response.ok) {
              // Stocker le token Laravel si nécessaire
              if (data.token) {
                localStorage.setItem('token', data.token);
              }

              // Vérifier si l'utilisateur doit compléter son profil
              if (data.needs_completion || !data.user.education_level) {
                // Rediriger vers la page de complétion de profil
                router.push('/inscription/details');
              } else {
                // Rediriger vers le tableau de bord selon le rôle
                if (data.user.role === 'TEACHER') {
                  router.push('/enseignant');
                } else {
                  router.push('/etudiant');
                }
              }
            } else {
              throw new Error(data.message || 'Erreur lors de l\'authentification');
            }
          }
        } else {
          throw new Error('Aucun token d\'accès trouvé');
        }
      } catch (error) {
        console.error('Erreur callback auth:', error);
        alert('Erreur lors de l\'authentification. Veuillez réessayer.');
        router.push('/connexion');
      }
    });

    return {};
  }
};
</script>

<style scoped>
.auth-callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-spinner {
  text-align: center;
  color: white;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid white;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-spinner p {
  font-size: 18px;
  font-weight: 500;
}
</style>
