<template>
  <div class="admin-form-container">
    <h3>Add Admin</h3>
    <form @submit.prevent="addAdmin">
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
      <select v-model="role" class="input-field">
        <option value="admin">Admin</option>
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
        <option value="tester">Tester</option>
      </select>
      <button type="submit" class="submit-button">Add Admin</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: "",
      role: "admin",
    };
  },
  methods: {
    addAdmin() {
      if (!this.username || !this.password) {
        alert("Please fill in all fields.");
        return;
      }

      const newAdmin = {
        username: this.username,
        password: this.password,
        role: this.role,
      };

      // Simulating an API call
      alert("Admin added successfully:", newAdmin);

      // Reset form fields
      this.username = "";
      this.password = "";
      this.role = "admin";
      console.log(`Adding admin: ${this.username}, Role: ${this.role}`);
    },
  },
};
</script>

<style scoped>
.admin-form-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.input-field {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.submit-button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #0056b3;
}
</style>
