<template>
  <div class="auth-buttons">
    <button class="auth-button login" @click="$emit('login')">
      Connexion
    </button>
    <button class="auth-button signup" @click="$emit('signup')">
      Inscription
    </button>
  </div>
</template>

<script>
export default {
  name: 'AuthButtons',
  emits: ['login', 'signup']
}
</script>

<style scoped>
@import './AuthButtons.css';
</style>
