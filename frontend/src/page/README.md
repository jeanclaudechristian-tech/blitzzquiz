# Pages

Ce dossier contient toutes les pages complètes de l'application BlitzzQuiz.

## Structure

Chaque page doit avoir:
- Un fichier `.vue` (composant Vue de la page)
- Un fichier `.css` (styles de la page)

## Pattern d'utilisation

```vue
<template>
  <div class="ma-page">
    <!-- Contenu de la page -->
    <!-- Utilisez les composants depuis ../composant/ -->
  </div>
</template>

<script>
import MonComposant from '../composant/MonComposant.vue'

export default {
  name: 'MaPage',
  components: {
    MonComposant
  },
  data() {
    return {
      // Données de la page
    }
  },
  methods: {
    // Méthodes de la page
  }
}
</script>

<style scoped>
@import './MaPage.css';
</style>
```

## Ajout au routeur

N'oubliez pas d'ajouter vos nouvelles pages dans `src/router/index.js`:

```javascript
import MaPage from '../page/MaPage.vue'

const routes = [
  {
    path: '/ma-page',
    name: 'MaPage',
    component: MaPage
  }
]
```
