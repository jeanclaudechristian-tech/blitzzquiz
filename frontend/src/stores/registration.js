import { defineStore } from 'pinia'

export const useRegistrationStore = defineStore('registration', {
  state: () => ({
    niveauEtude: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',        // TEACHER ou STUDENT
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
      // 确保传入的对象有 google_id
      this.googleUser = {
        googleId: googleData.google_id,
        email: googleData.email,
        avatar: googleData.avatar
      };
      this.email = googleData.email;
      this.role = 'STUDENT';
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
