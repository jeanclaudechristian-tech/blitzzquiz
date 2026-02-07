<template>
  <section id="section-jouer" class="quiz-card-section">
    <div class="section-content">
      <div class="cards-grid">
        <QuizCard
          v-for="(card, index) in cards"
          :key="index"
          :title="card.title"
          :imageSrc="card.imageSrc"
          @play="handlePlay(card)"
        />
      </div>
    </div>
  </section>
</template>

<script>
import QuizCard from './QuizCard.vue'

export default {
  name: 'QuizCardSection',
  components: {
    QuizCard
  },
  data() {
    return {
      cards: [
        {
          title: 'Lorem Ipsum',
          /* metre une image1 */
          imageSrc: 'https://via.placeholder.com/400x250?text=Quiz+1'
        },
        {
          title: 'Lorem Ipsum',
            /* metre une image2 */
          imageSrc: 'https://via.placeholder.com/400x250?text=Quiz+2'
        },
        {
          title: 'Lorem Ipsum',
            /* metre une image3 */
          imageSrc: 'https://via.placeholder.com/400x250?text=Quiz+3'
        }
      ]
    }
  },
  methods: {
    handlePlay(card) {
      console.log('Play quiz:', card.title)
    }
  }
}
</script>

<style scoped>
@import './QuizCardSection.css';
</style>
