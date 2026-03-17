<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { groupService } from '../../api/groups'
import AppHeader from '../../accueil-ui/composant/AppHeader.vue'

const router = useRouter()
const code = ref('')
const error = ref('')
const loading = ref(false)

const onInput = () => {
  code.value = code.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  error.value = ''
}

// Dans EnterGroupCodePage.vue, remplace ton handleSubmit par celui-ci :
const handleSubmit = async () => {
  error.value = ''
  const cleanCode = code.value.trim().toUpperCase()

  if (cleanCode.length !== 6) {
    error.value = 'Code invalide (6 caractères requis).'
    return
  }

  loading.value = true
  try {
    // 🎯 On récupère la réponse de l'API
    const { data } = await groupService.joinByCode(cleanCode)
    
    // 🎯 On utilise data.group_id car c'est ce que ton controller renvoie
    if (data && data.group_id) {
      router.push(`/etudiant/groupes/${data.group_id}/quiz`)
    } else {
      console.error("Clé group_id manquante dans la réponse :", data)
      error.value = "Erreur de redirection : ID de groupe introuvable."
    }
  } catch (e) {
    if (e.response?.status === 404) {
      error.value = 'Aucun groupe trouvé pour ce code.'
    } else {
      error.value = "Erreur lors de la vérification du code."
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/etudiant')
}
</script>

<template>
  <div class="join-page">
    <AppHeader />

    <main class="main-layout container-blitzz center-content">
      <div class="join-card">
        <button class="back-link" @click="goBack">← Retour au dashboard</button>

        <h1 class="anton-title">REJOINDRE UN GROUPE</h1>
        <p class="subtitle">Indique le code à 6 caractères partagé par ton enseignant.</p>

        <form class="code-form" @submit.prevent="handleSubmit">
          <div class="input-wrapper">
            <input v-model="code" type="text" maxlength="6" class="code-input" placeholder="ABC123" @input="onInput"
              :disabled="loading" />
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <button type="submit" class="submit-btn" :disabled="loading || code.length < 6">
            {{ loading ? 'VÉRIFICATION...' : 'REJOINDRE LE GROUPE' }}
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;800&display=swap');

.join-page {
  background: #fff;
  min-height: 100vh;
  padding-top: 130px;
  font-family: 'Inter', sans-serif;
}

.center-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
}

.join-card {
  background: #50CAFF;
  padding: 50px 40px;
  border-radius: 24px;
  text-align: center;
  color: white;
  box-shadow: 0 20px 50px rgba(80, 202, 255, 0.3);
  max-width: 550px;
  width: 100%;
}

.back-link {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.anton-title {
  font-family: 'Anton';
  font-size: 3.5rem;
  line-height: 1;
  margin-bottom: 15px;
}

.subtitle {
  font-weight: 600;
  margin-bottom: 40px;
  opacity: 0.9;
}

.input-wrapper {
  background: white;
  border-radius: 16px;
  padding: 5px;
  margin-bottom: 20px;
}

.code-input {
  width: 100%;
  border: none;
  padding: 20px;
  font-size: 2rem;
  font-weight: 900;
  text-align: center;
  letter-spacing: 10px;
  color: #111;
  text-transform: uppercase;
  outline: none;
  background: transparent;
}

.submit-btn {
  background: #111;
  color: white;
  border: none;
  padding: 20px;
  width: 100%;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  background: #222;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-msg {
  color: #fff;
  background: rgba(255, 0, 0, 0.3);
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 700;
}
</style>