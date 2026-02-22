import { supabase } from '@/lib/supabaseClient' // BON
// import supabase from '@/lib/supabaseClient' // MAUVAIS (export default manquant)


<template>
  <div class="callback-loading">
    <p>Connexion en cours avec Google...</p>
    <!-- Tu peux mettre un spinner ici -->
  </div>
</template>

<script>
import { supabase } from '../lib/supabaseClient'
import { useRegistrationStore } from '../stores/registration'
import { authService } from '../api/auth' // Assure-toi d'avoir une méthode checkGoogleUser

export default {
  name: 'AuthCallback',
  async mounted() {
    const registrationStore = useRegistrationStore()
    
    // 1. Récupérer la session Supabase (Google)
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      console.error("Erreur session Google", error)
      this.$router.push('/connexion')
      return
    }

    const googleUser = session.user

    try {
      // 2. Vérifier si l'utilisateur existe déjà côté Laravel
      // Il faut une route API POST /api/auth/check-google qui retourne 200 (existe) ou 404 (nouveau)
      const response = await authService.checkGoogleUser(googleUser.email)

      // CAS A : IL EXISTE -> Connexion réussie
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // Redirection selon le rôle
      if (response.user.role === 'TEACHER') this.$router.push('/enseignant')
      else this.$router.push('/etudiant')

    } catch (apiError) {
      
      // CAS B : IL N'EXISTE PAS (404) -> Inscription
      if (apiError.response && apiError.response.status === 404) {
        
        console.log("Nouvel utilisateur Google -> Direction Inscription")
        
        // On stocke les infos Google dans le store
        registrationStore.startGoogleFlow({
          email: googleUser.email,
          googleId: googleUser.id,
          name: googleUser.user_metadata.full_name,
          avatar: googleUser.user_metadata.avatar_url
        })

        // On redirige vers la Page 1 pour choisir le niveau
        this.$router.push('/inscription')

      } else if (apiError.response && apiError.response.status === 403) {
        // Cas Professeur bloqué
        alert("Les enseignants doivent utiliser leur mot de passe.")
        this.$router.push('/connexion')
      } else {
        console.error("Erreur backend", apiError)
        alert("Erreur de connexion serveur")
      }
    }
  }
}
</script>

<style scoped>
.callback-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  font-size: 1.2rem;
  color: #333;
}
</style>
