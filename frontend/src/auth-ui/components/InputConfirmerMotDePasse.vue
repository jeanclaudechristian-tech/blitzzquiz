<template>
  <div class="input-confirmer-mot-de-passe" :class="{ 'disabled-state': disabled }">
    <div class="icon-left">
      <img src="../../assets/passwordIcon.svg" alt="Password icon" />
    </div>
    <input 
      :type="showPassword ? 'text' : 'password'"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      placeholder="Confirmer mot de passe"
      class="input-field"
      :disabled="disabled"
    />
    <div class="icon-right" @click="!disabled && togglePassword()">
      <img :src="showPassword ? eyeIcon : eyeOffIcon" alt="Toggle password visibility" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'InputConfirmerMotDePasse',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      showPassword: false,
      eyeIcon: new URL('../../assets/eyeIcon.svg', import.meta.url).href,
      eyeOffIcon: new URL('../../assets/eyeOffIcon.svg', import.meta.url).href
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    }
  }
}
</script>

<style scoped>
/* Assure-toi que ce fichier CSS existe bien, sinon remets le CSS brut que tu m'avais donné */
@import './InputConfirmerMotDePasse.css'; 

.disabled-state {
  opacity: 0.6;
  pointer-events: none;
}
</style>
