<template>
  <div class="shop-container">
    <h1>Do'kon</h1>
    <div class="shop-content">
      <div class="product-grid">
        <Card
          v-for="item in items"
          :key="item.id"
          :item="item"
          @add-to-cart="addToCart"
        />
      </div>
      <Basket
        :cart="cart"
        @update-quantity="updateQuantity"
        @remove-item="removeFromCart"
      />
    </div>
  </div>
</template>

<script>
import Card from "./card.vue";
import Basket from "./Basket.vue";

export default {
  name: "Shop",
  components: {
    Card,
    Basket,
  },
  data() {
    return {
      items: [
        {
          id: 1,
          name: "Premium Test To'plami",
          description: "Barcha fanlardan maxsus testlar",
          price: 1500,
          image: new URL("../assets/shopImg/product1.webp", import.meta.url)
            .href,
          tag: "Premium",
        },
        {
          id: 2,
          name: "Video Darslar",
          description: "Professional o'qituvchilardan video darslar",
          price: 2000,
          image: new URL("../assets/shopImg/product2.webp", import.meta.url)
            .href,
          tag: "NEW",
        },
        {
          id: 3,
          name: "Study Materials",
          description: "O'quv qo'llanmalar to'plami",
          price: 1000,
          image: new URL("../assets/shopImg/product3.webp", import.meta.url)
            .href,
        },
      ],
      // cart: []
    };
  },
  methods: {
    addToCart(item) {
      const existingItem = this.cart.find((i) => i.id === item.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.cart.push({ ...item, quantity: 1 });
      }
    },
    updateQuantity({ item, change }) {
      const cartItem = this.cart.find((i) => i.id === item.id);
      if (cartItem) {
        const newQuantity = cartItem.quantity + change;
        if (newQuantity > 0) {
          cartItem.quantity = newQuantity;
        } else {
          this.removeFromCart(item);
        }
      }
    },
    removeFromCart(item) {
      const index = this.cart.findIndex((i) => i.id === item.id);
      if (index > -1) {
        this.cart.splice(index, 1);
      }
    },
  },
};
</script>

<style scoped>
.shop-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

.shop-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

@media (max-width: 1024px) {
  .shop-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .shop-container {
    padding: 1rem;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }
}
</style>
