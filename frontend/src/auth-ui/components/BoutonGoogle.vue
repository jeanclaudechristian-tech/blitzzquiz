<template>
  <div class="bouton-google" @click="loginWithGoogle" :class="{ 'disabled': isLoading }">
    <div class="button-background"></div>
    <div class="button-text">
      <p>{{ isLoading ? 'Connexion en cours...' : 'Se connecter avec Google' }}</p>
    </div>
    <div class="google-icon">
      <img src="../../assets/googleIcon1.svg" alt="Google icon" />
    </div>
  </div>
</template>

<script>
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERREUR: Variables Supabase manquantes dans .env')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default {
  name: 'BoutonGoogle',
  data() {
    return {
      isLoading: false
    }
  },
  methods: {
    async loginWithGoogle() {
      if (this.isLoading) return

      if (!supabaseUrl || !supabaseAnonKey) {
        alert('Configuration Supabase manquante. Vérifiez votre fichier .env')
        return
      }

      this.isLoading = true

      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          },
        })

        if (error) throw error

        console.log('Redirection vers Google OAuth...')

      } catch (error) {
        console.error('Erreur login Google:', error.message)
        alert('Erreur lors de la connexion Google: ' + error.message)
        this.isLoading = false
      }
    },
  },
}
</script>

<style scoped>
@import './BoutonGoogle.css';

.bouton-google {
  cursor: pointer;
  transition: opacity 0.2s;
}

.bouton-google.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
