<template>
  <div class="custom-dropdown">
    <button @click="toggleDropdown" class="dropdown-toggle">
      {{ selectedOption || 'Select Option' }}
    </button>
    <ul v-if="isOpen" class="dropdown-menu">
      <li v-for="option in options" :key="option.value" @click="selectOption(option)">
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      required: true,
    },
    initialValue: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      isOpen: false,
      selectedOption: this.initialValue,
    };
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    selectOption(option) {
      this.selectedOption = option.label;
      this.isOpen = false;
      this.$emit('option-selected', option.value);
    },
  },
};
</script>

<style scoped>
.custom-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  /* Style your button */
}

.dropdown-menu {
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 100; /* Ensure it appears above other elements */
}

.dropdown-menu li {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-menu li:hover {
  background-color: #f0f0f0;
}
</style>