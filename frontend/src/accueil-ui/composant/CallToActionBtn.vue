<template>
  <button :class="['cta-button', variant]" @click="$emit('click')">
    {{ text }}
  </button>
</template>

<script>
export default {
  name: 'CallToActionBtn',
  props: {
    text: {
      type: String,
      default: 'S\'inscrire'
    },
    variant: {
      type: String,
      default: 'dark', // 'dark' ou 'blue'
      validator: (value) => ['dark', 'blue'].includes(value)
    }
  },
  emits: ['click']
}
</script>

<style scoped>
@import './CallToActionBtn.css';
</style>
