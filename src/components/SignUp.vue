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
      <!-- Continue with google button -->
      <div class="google-signup">
        <button @click.prevent="handleGoogleSignUp" type="button">
          <img src="../assets/img/googleicon.svg" alt="Google Icon" />
          Continue with Google
        </button>
      </div>
      <!-- Continue with google button  end -->
      <div class="link-button">
        <router-link to="/login">
          Already have an account? <span>Login</span>
        </router-link>
      </div>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { auth } from '@/config/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { generateReferralCode } from '@/utils/generateReferralCode';
import { handleReferral } from '@/utils/referral';

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
    const route = useRoute();
    const referralCode = ref('');

    onMounted(() => {
      referralCode.value = route.query.ref || '';
    });

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

        await updateProfile(userCredential.user, {
          displayName: username.value,
        });

        await generateReferralCode(); // Referral kod yaratish
        await handleReferral(referralCode.value, userCredential.user.uid); // Agar ref bo‘lsa, unga points beriladi

        successMessage.value = 'Successfully registered!';
        router.push('/');
      } catch (error) {
        errorMessage.value = error.message;
      }
    };

    const handleGoogleSignUp = async () => {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const referral = route.query.ref || '';
        const referralCode = user.uid.slice(0, 6).toUpperCase();

        await setDoc(
          doc(db, 'users', user.uid),
          {
            email: user.email,
            displayName: user.displayName,
            referralCode,
            points: 0,
          },
          { merge: true }
        );

        if (referral) {
          await handleReferral(referral, user.uid);
        }

        successMessage.value = 'Google SignUp successful!';
        router.push('/');
      } catch (error) {
        errorMessage.value = 'Google SignUp error: ' + error.message;
        console.error(error);
      }
    };

    return {
      username,
      email,
      password,
      showPassword,
      togglePasswordVisibility,
      handleSubmit,
      handleGoogleSignUp,
      errorMessage,
      successMessage,
    };
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.google-signup {
  margin-top: 20px;
}
.google-signup button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s;
}
.google-signup button:hover {
  background-color: #f8f8f8;
  border-color: #999;
}
.google-signup img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.signup-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  background-color: white;
}

form {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
  text-align: center;
}

.input-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  transition: border 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.input-group input:focus {
  border-color: #1e3c72;
  outline: none;
  box-shadow: 0 0 5px rgba(30, 60, 114, 0.5);
}

.password-input-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
}

.signup-button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.signup-button:hover {
  background-color: #0056b3;
}

.link-button {
  margin-top: 20px;
  text-align: center;
}

.link-button a {
  color: #333;
  text-decoration: none;
}

.link-button span {
  color: #007bff;
  font-weight: bold;
}

.error {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  text-align: center;
}

.success {
  margin-top: 15px;
  padding: 10px;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  text-align: center;
}

/* Responsive styles */
@media (max-width: 480px) {
  form {
    padding: 20px;
  }

  .input-group input {
    padding: 10px;
  }

  .signup-button {
    padding: 10px;
  }
}

@media (max-width: 320px) {
  form {
    padding: 15px;
  }

  h2 {
    font-size: 20px;
  }

  .input-group {
    margin-bottom: 15px;
  }
}
</style>
