<template>
  <router-view v-slot="{ Component, route }">
    
    <keep-alive :exclude="['QuizModal', 'QuizOverlay']">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>

  </router-view>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  /* LA CORRECTION EST ICI : on utilise min-height au lieu de height fixe */
  min-height: 100vh; 
  overflow-x: hidden;
  background-color: #f3f4f6; /* Petite couleur de fond neutre quand le quiz est actif */
}
</style>