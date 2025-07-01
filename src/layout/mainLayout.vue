<template>
  <div class="mainLayout">
    <Navbar />
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script>
import Navbar from "../components/navbar.vue";

export default {
  components: {
    Navbar,
  },
  methods: {
    showSuccessToast() {
      this.$toast({
        text: "Operation successful!",
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "green",
        close: true,
        stopOnFocus: true,
      }).showToast();
    },
    showErrorToast(message) {
      this.$toast({
        text: `Error: ${message}`,
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "red",
        close: true,
        stopOnFocus: true,
      }).showToast();
    },
  },
};
</script>

<style></style>
