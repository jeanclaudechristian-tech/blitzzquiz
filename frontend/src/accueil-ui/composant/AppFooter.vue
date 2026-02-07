<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-left">
        <a href="/" class="footer-logo-link" aria-label="Blitzz Quiz">
          <img
            src="/images/Black_BlitzzQuiz%202.svg"
            alt="Blitzz Quiz"
            class="footer-logo-img"
          />
        </a>
        <SocialIcons />
      </div>
      <div class="footer-columns">
        <FooterColumn
          id="section-community"
          title="Communauté"
          :links="communauteLinks"
        />
        <FooterColumn
          id="section-contact"
          title="Contact"
          :links="contactLinks"
        />
        <FooterColumn
          id="section-resources"
          title="Resources"
          :links="resourcesLinks"
        />
      </div>
    </div>
  </footer>
</template>

<script>
import SocialIcons from './SocialIcons.vue'
import FooterColumn from './FooterColumn.vue'

export default {
  name: 'AppFooter',
  components: {
    SocialIcons,
    FooterColumn
  },
  data() {
    return {
      communauteLinks: [
        { text: 'UI design', href: '#' },
        { text: 'UX design', href: '#' },
        { text: 'Wireframing', href: '#' },
        { text: 'Diagramming', href: '#' },
        { text: 'Brainstorming', href: '#' },
        { text: 'Online whiteboard', href: '#' },
        { text: 'Team collaboration', href: '#' }
      ],
      contactLinks: [
        { text: 'Design', href: '#' },
        { text: 'Prototyping', href: '#' },
        { text: 'Development features', href: '#' },
        { text: 'Design systems', href: '#' },
        { text: 'Collaboration features', href: '#' },
        { text: 'Design process', href: '#' },
        { text: 'Figma', href: '#' }
      ],
      resourcesLinks: [
        { text: 'Blog', href: '#' },
        { text: 'Best practices', href: '#' },
        { text: 'Colors', href: '#' },
        { text: 'Color wheel', href: '#' },
        { text: 'Support', href: '#' },
        { text: 'Developers', href: '#' },
        { text: 'Resource library', href: '#' }
      ]
    }
  }
}
</script>

<style scoped>
@import './AppFooter.css';
</style>
