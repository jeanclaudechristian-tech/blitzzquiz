<template>
  <a :href="href" :class="['nav-link', { active: active }]" @click.prevent="$emit('click')">
    {{ text }}
  </a>
</template>

<script>
export default {
  name: 'NavLink',
  props: {
    text: {
      type: String,
      required: true
    },
    href: {
      type: String,
      default: '#'
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click']
}
</script>

<style scoped>
@import './NavLink.css';
</style>
