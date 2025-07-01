<template>
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>Sorry, the page you are looking for does not exist.</p>
    <router-link to="/">Go back to Home</router-link>
  </div>
</template>

<script>
export default {
  name: "NotFound",
};
</script>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 50px;
  padding: 2rem;
}

.not-found h1 {
  font-size: 3rem;
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.not-found p {
  font-size: 1.2rem;
  margin: 20px 0;
  color: #666;
}

.not-found a {
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: linear-gradient(145deg, #0056b3, #007bff);
  color: white;
}

.not-found a:hover {
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: 0 7px 15px rgba(0, 123, 255, 0.545);
}
</style>
