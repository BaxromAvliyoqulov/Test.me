<template>
  <div class="modal" v-if="show">
    <div class="modal-content">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <input
          type="text"
          v-model="username"
          class="input-field"
          placeholder="Username"
        />
        <input
          type="password"
          v-model="password"
          class="input-field"
          placeholder="Password"
        />
        <button type="submit" class="login-button">Login</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: ["show"],
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    login() {
      if (this.username === "boss" && this.password === "1") {
        this.$emit("authenticated", true);
      } else {
        this.$emit("authenticated", false);
        alert("Foydalanuvchi nomi yoki parol noto'g'ri");
      }
    },
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 300px;
  text-align: center;
}

.input-field {
  width: 90%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.login-button {
  width: 90%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #0056b3;
}
</style>
