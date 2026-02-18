<template>
  <div class="bouton-google" @click="loginWithGoogle">
    <div class="button-background"></div>
    <div class="button-text">
      <p>Inscription avec Google</p>
    </div>
    <div class="google-icon">
      <img src="../../assets/googleIcon1.svg" alt="Google icon" />
    </div>
  </div>
</template>

<script>
import { createClient } from '@supabase/supabase-js'

// Initialise le client Supabase (assure-toi que les variables sont dans .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default {
  name: 'BoutonGoogle',
  methods: {
    async loginWithGoogle() {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            // URL de retour vers ton app Vue (page Callback qu'on va créer)
            redirectTo: window.location.origin + '/auth/callback',
          },
        })
        if (error) throw error
      } catch (error) {
        console.error('Erreur login Google:', error.message)
        alert('Erreur lors de la connexion Google')
      }
    },
  },
}
</script>

<style scoped>
@import './BoutonGoogle.css';

/* Ajout pour rendre le div cliquable comme un bouton */
.bouton-google {
  cursor: pointer;
}
</style>
