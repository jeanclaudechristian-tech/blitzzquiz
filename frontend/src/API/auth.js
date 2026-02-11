import api from './Axios'

export const authService = {
  async login(email, password) {
    const response = await api.post('/login', { email, password })
    return response.data
  },

  async register(email, username, password, password_confirmation, role) {
    const response = await api.post('/register', {
      email,
      nickname : username,                 // ou nickname si ton backend l’attend
      password,
      password_confirmation,
      role                      // très important pour ta BD
    })
    return response.data
  },

  async logout() {
    const response = await api.post('/logout')
    return response.data
  },

  async getCurrentUser() {
    const response = await api.get('/user')
    return response.data
  }
}
