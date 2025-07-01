<template>
  <div class="product-card">
    <div class="image-container">
      <img :src="item.image" :alt="item.name" class="product-image" />
      <span v-if="item.tag" class="tag">{{ item.tag }}</span>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ item.name }}</h3>
      <p class="product-description">{{ item.description }}</p>
      <div class="product-footer">
        <span class="price">{{ item.price }} TP</span>
        <button @click="$emit('add-to-cart', item)" class="buy-button">
          Buy Now
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProductCard",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(145deg, #0056b3, #007bff);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.product-info {
  padding: 1rem;
}

.product-name {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.buy-button {
  background: linear-gradient(145deg, #0056b3, #007bff);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.buy-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
}
</style>
