<template>
  <div class="input-courriel" :class="{ 'disabled-state': disabled }">
    <div class="icon-container">
      <img src="../../assets/envelopeIcon.svg" alt="Email icon" />
    </div>
    <input 
      type="email"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      class="input-field"
      :disabled="disabled"
    />
  </div>
</template>

<script>
export default {
  name: 'InputCourriel',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Courriel (personnel ou scolaire)'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
@import './InputCourriel.css';

/* Seul ajout : opacité quand désactivé, sans toucher aux dimensions */
.disabled-state {
  opacity: 0.6;
  pointer-events: none;
}
</style>
