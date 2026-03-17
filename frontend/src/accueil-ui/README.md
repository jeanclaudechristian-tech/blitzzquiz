# Composants

Ce dossier contient tous les composants réutilisables pour l'application BlitzzQuiz.

## Structure

Chaque composant doit avoir:
- Un fichier `.vue` (composant Vue)
- Un fichier `.css` (styles du composant)

## Pattern d'utilisation

```vue
<template>
  <div class="mon-composant">
    <!-- Contenu du composant -->
  </div>
</template>

<script>
export default {
  name: 'MonComposant'
}
</script>

<style scoped>
@import './MonComposant.css';
</style>
```

## Palette de couleurs (référence)

- **Primaire**: #50CAFF (bleu clair)
- **Fond obscure**: #24201D (noir foncé)
- **Texte secondaire**: #9F9F9F (gris)
- **Fond textes**: #F6FEFF (blanc cassé)
- **Bouton**: #0039F4 (bleu)
- **Tertiaire**: #F0991F (orange)
