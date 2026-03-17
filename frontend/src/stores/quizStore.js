import { defineStore } from 'pinia';

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    // Indique si un quiz est actuellement ouvert dans un modal
    isModalOpen: false
  }),
  actions: {
    // Permet de changer l'état (ouvert/fermé) depuis n'importe quel composant
    setModalOpen(status) {
      this.isModalOpen = status;
    }
  }
});