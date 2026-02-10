<template>
  <div :id="id" class="footer-column">
    <h4 class="column-title">{{ title }}</h4>
    <ul class="column-links">
      <li v-for="(link, index) in links" :key="index">
        <a :href="link.href" class="footer-link">{{ link.text }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'FooterColumn',
  props: {
    id: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      required: true
    },
    links: {
      type: Array,
      required: true,
      validator: (links) => {
        return links.every(link => link.text && link.href)
      }
    }
  }
}
</script>

<style scoped>
@import './FooterColumn.css';
</style>
