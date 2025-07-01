<template>
  <div class="signup-container">
    <h2>Create Account</h2>

    <form @submit.prevent="handleSubmit">
      <div class="input-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required />
      </div>

      <div class="input-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required />
      </div>

      <div class="input-group">
        <label for="password">Password:</label>
        <div class="password-input-wrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            v-model="password"
            required
            maxlength="10"
          />
          <span class="toggle-password" @click="togglePasswordVisibility">
            <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
          </span>
        </div>
      </div>

      <button type="submit" class="signup-button">Sign Up</button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '@/config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default {
  name: 'Signup',
  setup() {
    const username = ref('');
    const email = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');

    const router = useRouter();

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    const handleSubmit = async () => {
      errorMessage.value = '';
      successMessage.value = '';

      if (!email.value || !password.value || !username.value) {
        errorMessage.value = 'All fields are required.';
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.value,
          password.value
        );

        // Save username as displayName
        await updateProfile(userCredential.user, {
          displayName: username.value,
        });

        successMessage.value = 'Successfully registered!';
        router.push('/'); // or another page
      } catch (error) {
        errorMessage.value = error.message;
      }
    };

    return {
      username,
      email,
      password,
      showPassword,
      togglePasswordVisibility,
      handleSubmit,
      errorMessage,
      successMessage,
    };
  },
};
</script>

<style scoped>
.signup-container {
  max-width: 400px;
  margin: auto;
  padding: 2rem;
  background-color: #f7f7f7;
  border-radius: 10px;
}

h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.input-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.4rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.password-input-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  cursor: pointer;
}

.signup-button {
  width: 100%;
  padding: 0.7rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.error {
  color: red;
  margin-top: 1rem;
  text-align: center;
}

.success {
  color: green;
  margin-top: 1rem;
  text-align: center;
}
</style>
