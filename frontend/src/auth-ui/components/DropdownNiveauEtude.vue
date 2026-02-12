<template>
  <div class="dropdown-niveau-etude" @click="toggleDropdown" ref="dropdown">
    <div class="dropdown-header">
      <span
        class="dropdown-text"
        :class="{ placeholder: !modelValue }"
      >
        {{ selectedLabel || 'Choisir' }}
      </span>
      <div class="arrow-icon" :class="{ 'open': isOpen }">
        <img src="../../assets/dropDownIcon.svg" alt="dropdown arrow" />
      </div>
    </div>
    <transition name="dropdown-fade">
      <div v-if="isOpen" class="dropdown-list">
        <div 
          v-for="option in options" 
          :key="option.value"
          class="dropdown-option"
          :class="{ 'selected': modelValue === option.value, 'disabled': option.value === '' }"
          @click.stop="selectOption(option.value)"
        >
          {{ option.label }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'DropdownNiveauEtude',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isOpen: false,
      options: [
        { value: '', label: 'Choisir' },
        { value: 'universitaire', label: 'Universitaire' },
        { value: 'collegial', label: 'Collégial' },
        { value: 'secondaire', label: 'Secondaire' },
        { value: 'primaire', label: 'Primaire' }
      ]
    };
  },
  computed: {
    selectedLabel() {
      const option = this.options.find(opt => opt.value === this.modelValue);
      return option ? option.label : '';
    }
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    selectOption(value) {
      if (value !== '') {
        this.$emit('update:modelValue', value);
      }
      this.isOpen = false;
    },
    handleClickOutside(event) {
      if (this.$refs.dropdown && !this.$refs.dropdown.contains(event.target)) {
        this.isOpen = false;
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
}
</script>

<style scoped>
@import './DropdownNiveauEtude.css';
</style>
