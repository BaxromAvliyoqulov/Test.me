<template>
  <div class="basket">
    <h2 class="basket-title">Savatcha</h2>
    <ul class="basket-list">
      <li v-for="item in cart" :key="item.id" class="basket-item">
        <div class="item-info">
          <span class="item-name">{{ item.name }}</span>
          <div class="item-controls">
            <button @click="updateQuantity(item, -1)" class="quantity-btn">
              -
            </button>
            <span class="quantity">{{ item.quantity }}</span>
            <button @click="updateQuantity(item, 1)" class="quantity-btn">
              +
            </button>
          </div>
          <span class="item-price">{{ item.price * item.quantity }} TP</span>
        </div>
        <button @click="removeItem(item)" class="remove-btn">×</button>
      </li>
    </ul>
    <div class="basket-footer">
      <div class="total">
        Jami: <span>{{ total }} TP</span>
      </div>
      <button @click="checkout" class="checkout-btn">Sotib olish</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Basket",
  props: {
    // cart: {
    //     type: Array,
    //     required: true
    // }
  },
  computed: {
    // total() {
    //     return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // }
  },
  // methods: {
  //     updateQuantity(item, change) {
  //         this.$emit('update-quantity', { item, change });
  //     },
  //     removeItem(item) {
  //         this.$emit('remove-item', item);
  //     },
  //     checkout() {
  //         this.$emit('checkout');
  //     }
  // }
};
</script>

<style scoped>
.basket {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.basket-title {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.basket-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.basket-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.item-name {
  flex: 1;
  font-weight: 500;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.quantity-btn:hover {
  background: #e9ecef;
}

.quantity {
  min-width: 30px;
  text-align: center;
}

.item-price {
  font-weight: 600;
  color: #2c3e50;
}

.remove-btn {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
}

.basket-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.checkout-btn {
  background: linear-gradient(145deg, #0056b3, #007bff);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
}
</style>
