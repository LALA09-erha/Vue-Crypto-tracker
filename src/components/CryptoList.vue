<template>
  <div class="crypto-list">
    <div class="list-container">
      <div 
        v-for="crypto in cryptoList" 
        :key="crypto.id"
        class="crypto-item"
        :class="{ active: selectedCrypto === crypto.id }"
        @click="$emit('crypto-selected', crypto.id)"
      >
        <div class="crypto-icon" :style="{ backgroundColor: crypto.color }">
          {{ crypto.symbol.charAt(0) }}
        </div>
        <div class="crypto-info">
          <div class="crypto-name">{{ crypto.name }}</div>
          <div class="crypto-symbol">{{ crypto.symbol }}</div>
        </div>
        <div class="crypto-indicator">
          <div class="indicator-dot" :style="{ backgroundColor: crypto.color }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CryptoList',
  props: {
    cryptoList: {
      type: Array,
      required: true
    },
    selectedCrypto: {
      type: String,
      required: true
    }
  },
  emits: ['crypto-selected']
}
</script>

<style scoped>
.crypto-list {
  padding: 0;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.crypto-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.crypto-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.crypto-item:hover::before {
  left: 100%;
}

.crypto-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.crypto-item.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.crypto-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 0.875rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.crypto-info {
  flex: 1;
}

.crypto-name {
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.crypto-symbol {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.crypto-indicator {
  padding-left: 1rem;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0.7;
}

.crypto-item.active .indicator-dot {
  opacity: 1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .crypto-item {
    padding: 0.875rem 1rem;
  }
  
  .crypto-icon {
    width: 36px;
    height: 36px;
    margin-right: 0.875rem;
  }
}
</style>