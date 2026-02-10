<template>
  <div class="quiz-card">
    <div class="card-image">
      <img :src="imageSrc" :alt="title" />
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <button class="card-button" @click="$emit('play')">
        Jouer
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuizCard',
  props: {
    title: {
      type: String,
      default: 'Lorem Ipsum'
    },
    imageSrc: {
      type: String,
      default: 'https://via.placeholder.com/400x250?text=Quiz+Image'
    }
  },
  emits: ['play']
}
</script>

<style scoped>
@import './QuizCard.css';
</style>
