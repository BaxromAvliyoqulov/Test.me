<template>
  <mainLayout>
    <router-view />
  </mainLayout>
</template>

<script>
import MainLayout from "@/layout/mainLayout.vue";
export default {
  components: {
    MainLayout,
  },
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: "Poppins", sans-serif;
}
a {
  text-decoration: none;
  color: black;
  font-size: 20px;
  font-weight: bold;
}
.button {
  padding: 10px 20px;
  font-size: 18px;
  font-weight: 700;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
  margin-top: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
}

.button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0px 10px 8px rgba(0, 0, 0, 0.3);
}

.button:active {
  transform: translateY(2px);
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
}
.gradient-text {
  background: linear-gradient(145deg, #0056b3, #007bff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

@media (max-width: 768px) {
  button {
    max-width: 100%;
  }
}
</style>
