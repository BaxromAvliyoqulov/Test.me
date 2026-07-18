<template>
  <div class="product-form-container">
    <h3>Add Product</h3>
    <form @submit.prevent="addProduct">
      <input
        type="text"
        v-model="productName"
        class="input-field"
        placeholder="Product Name"
      />
      <input
        type="number"
        v-model="price"
        class="input-field"
        placeholder="Price"
      />
      <textarea
        v-model="description"
        class="textarea-field"
        placeholder="Description"
      ></textarea>
      <button type="submit" class="submit-button">Add Product</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const productName = ref("");
const price = ref(0);
const description = ref("");

const addProduct = () => {
  // Add product logic
  if (!productName.value || price.value <= 0 || !description.value) {
    alert("Please fill in all fields with valid data.");
    return;
  }

  const newProduct = {
    name: productName.value,
    price: price.value,
    description: description.value,
  };

  // Simulate saving the product (e.g., API call)
  console.log("Product added:", newProduct);

  // Reset form fields
  productName.value = "";
  price.value = 0;
  description.value = "";
  alert("Product added successfully!");
  console.log(`Adding product: ${productName.value}, Price: ${price.value}`);
};
</script>

<style scoped>
.product-form-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.textarea-field {
  height: 100px;
  resize: none;
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
