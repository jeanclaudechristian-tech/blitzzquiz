import { defineStore } from 'pinia'

export const useRegistrationStore = defineStore('registration', {
  state: () => ({
    niveauEtude: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',        // TEACHER ou STUDENT
    
    // NOUVEAU: Stocke les infos Google temporairement
    googleUser: null 
  }),

  getters: {
    // Helper pour savoir si on est dans le flux Google
    isGoogleFlow: (state) => !!state.googleUser
  },

  actions: {
    setNiveauEtude(niveau) {
      this.niveauEtude = niveau
    },

    setCredentials(email, username, password, confirmPassword) {
      this.email = email
      this.username = username
      this.password = password
      this.confirmPassword = confirmPassword
    },

    setRole(role) {        
      this.role = role
    },

    // NOUVEAU: Initialise le flux Google
    startGoogleFlow(googleData) {
      this.googleUser = googleData
      this.email = googleData.email
      this.role = 'STUDENT' // On force le rôle étudiant pour Google
    },

    reset() {
      this.niveauEtude = ''
      this.email = ''
      this.username = ''
      this.password = ''
      this.confirmPassword = ''
      this.role = ''
      this.googleUser = null
    },
  },
})
