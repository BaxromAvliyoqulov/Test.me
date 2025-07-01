<template>
  <div class="container">
    <LoginModal :show="!authenticated" @authenticated="handleAuthentication" />
    <div v-if="authenticated">
      <h2 class="title">Admin Panel</h2>
      <button class="button" @click="currentView = 'addSubject'">
        Add Subject
      </button>
      <button class="button" @click="currentView = 'addAdmin'">
        Add Admin
      </button>
      <button class="button" @click="currentView = 'addProduct'">
        Add Product
      </button>
      <button class="button" @click="logout">
        <i class="fas fa-sign-out-alt"></i>
        Logout
      </button>
      <!-- Komponentlarni shartli ko'rsatish -->
      <AddSubjectComponent v-if="currentView === 'addSubject'" />
      <AddAdminComponent v-if="currentView === 'addAdmin'" />
      <AddProductComponent v-if="currentView === 'addProduct'" />
    </div>
  </div>
</template>

<script>
import LoginModal from "./loginModal.vue";
import AddAdminComponent from "./addAdmin.vue";
import AddSubjectComponent from "./addSubject.vue";
import AddProductComponent from "./addProduct.vue";

export default {
  components: {
    LoginModal,
    AddAdminComponent,
    AddSubjectComponent,
    AddProductComponent,
  },
  data() {
    return {
      currentView: null,
      authenticated: false,
      selectedSubject: "",
      selectedLevel: "",
      tests: [],
      loading: false,
      status: null,
      subjects: ["English", "Math", "Physics", "History"],
      levels: ["Beginner"],
    };
  },
  created() {
    // Checking token
    const authToken = localStorage.getItem("adminAuth");
    if (authToken) {
      this.authenticated = true;
    }
  },
  methods: {
    handleAuthentication(status) {
      this.authenticated = status;
      if (!status) {
        localStorage.removeItem("adminAuth");
        this.$router.push("/");
      } else {
        localStorage.setItem("adminAuth", "true");
      }
    },
    logout() {
      localStorage.removeItem("adminAuth");
      this.authenticated = false;
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  padding-bottom: 40px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

button {
  margin-right: 10px;
}
</style>
