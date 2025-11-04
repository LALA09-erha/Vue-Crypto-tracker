<template>
  <div id="app" class="container-fluid">
    <!-- Header dengan gradient modern -->
    <div class="row">
      <div class="col-12">
        <header class="modern-header">
          <div class="container">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h1 class="display-6 fw-bold text-white mb-2">🚀 Crypto Tracker</h1>
                <p class="text-light mb-0 opacity-75">Monitor cryptocurrency secara real-time dengan analisis mendalam</p>
              </div>
              <div class="text-end">
                <div class="last-update text-light opacity-75">
                  <small>Update Terakhir: {{ lastUpdateTime }}</small>
                </div>
                <div class="api-status">
                  <span class="badge" :class="apiStatusClass">
                    {{ apiStatusText }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="row mt-4">
      <!-- Chart Section -->
      <div class="col-lg-8 mb-4">
        <div class="modern-card chart-section">
          <div class="card-header-modern d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title-modern mb-1">
                <span v-if="selectedCryptoInfo">{{ selectedCryptoInfo.name }} ({{ selectedCryptoInfo.symbol }})</span>
                <span v-else>Grafik Harga Crypto</span>
              </h5>
              <div v-if="selectedCryptoInfo" class="price-info">
                <span class="current-price">${{ selectedCryptoInfo.price.toFixed(2) }}</span>
                <span class="price-change" :class="selectedCryptoInfo.change24h >= 0 ? 'positive' : 'negative'">
                  {{ selectedCryptoInfo.change24h >= 0 ? '↗' : '↘' }} 
                  {{ Math.abs(selectedCryptoInfo.change24h).toFixed(2) }}%
                </span>
              </div>
            </div>
            <div class="time-periods">
              <div class="btn-group btn-group-sm">
                <button 
                  v-for="period in timePeriods" 
                  :key="period.value"
                  class="btn period-btn"
                  :class="selectedPeriod === period.value ? 'active' : ''"
                  @click="changeTimePeriod(period.value)"
                >
                  {{ period.label }}
                </button>
              </div>
            </div>
          </div>
          <div class="card-body-modern">
            <CryptoChart 
              :chart-data="chartData" 
              :options="chartOptions"
              :is-loading="isLoading"
            />
          </div>
        </div>
      </div>
      
      <!-- Sidebar -->
      <div class="col-lg-4">
        <!-- Crypto List -->
        <div class="modern-card">
          <div class="card-header-modern">
            <h5 class="card-title-modern mb-0">📊 Daftar Crypto</h5>
          </div>
          <div class="card-body-modern p-0">
            <CryptoList 
              :crypto-list="cryptoList"
              :selected-crypto="selectedCrypto"
              @crypto-selected="selectCrypto"
            />
          </div>
        </div>
        
        <!-- Crypto Info -->
        <div class="modern-card mt-4">
          <div class="card-header-modern">
            <h5 class="card-title-modern mb-0">ℹ️ Info Detail</h5>
          </div>
          <div class="card-body-modern">
            <div v-if="selectedCryptoInfo" class="crypto-details">
              <div class="detail-item">
                <span class="label">Market Cap</span>
                <span class="value">${{ formatNumber(selectedCryptoInfo.marketCap) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Volume 24h</span>
                <span class="value">${{ formatNumber(selectedCryptoInfo.volume24h) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">High 24h</span>
                <span class="value">${{ selectedCryptoInfo.high24h.toFixed(2) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Low 24h</span>
                <span class="value">${{ selectedCryptoInfo.low24h.toFixed(2) }}</span>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <div class="placeholder-icon">📈</div>
              <p class="text-muted mt-2 mb-0">Pilih cryptocurrency untuk melihat detail</p>
            </div>
          </div>
        </div>

        <!-- Market Stats -->
        <div class="modern-card mt-4">
          <div class="card-header-modern">
            <h5 class="card-title-modern mb-0">📈 Market Overview</h5>
          </div>
          <div class="card-body-modern">
            <div class="market-stats">
              <div class="stat-item">
                <div class="stat-value">{{ cryptoList.length }}</div>
                <div class="stat-label">Cryptocurrency</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">24/7</div>
                <div class="stat-label">Real-time</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ apiStatus === 'connected' ? 'Live' : 'Demo' }}</div>
                <div class="stat-label">Data Source</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-modern">
        <div class="spinner-circle"></div>
        <p class="mt-3 text-white">Memuat data terbaru...</p>
      </div>
    </div>
  </div>
</template>

<script>
import CryptoChart from './components/CryptoChart.vue'
import CryptoList from './components/CryptoList.vue'
import { fetchCryptoData, getOptimalHistoryData } from './services/cryptoApi'

export default {
  name: 'App',
  components: {
    CryptoChart,
    CryptoList
  },
  data() {
    return {
      cryptoList: [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', color: '#f7931a' },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: '#627eea' },
        { id: 'cardano', name: 'Cardano', symbol: 'ADA', color: '#0033ad' },
        { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', color: '#c2a633' },
        { id: 'solana', name: 'Solana', symbol: 'SOL', color: '#00ffbd' },
        { id: 'ripple', name: 'Ripple', symbol: 'XRP', color: '#23292f' },
        { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', color: '#e6007a' }
      ],
      selectedCrypto: 'bitcoin',
      selectedCryptoInfo: null,
      selectedPeriod: '7d',
      timePeriods: [
        { label: '24H', value: '1d' },
        { label: '7H', value: '7d' },
        { label: '30H', value: '30d' },
        { label: '90H', value: '90d' }
      ],
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Harga USD',
            data: [],
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#007bff',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false
      },
      isLoading: false,
      updateInterval: null,
      apiStatus: 'connecting',
      lastUpdateTime: '--:--:--'
    }
  },
  computed: {
    apiStatusClass() {
      return {
        'connected': 'bg-success',
        'error': 'bg-warning',
        'connecting': 'bg-secondary'
      }[this.apiStatus]
    },
    apiStatusText() {
      return {
        'connected': 'API Connected',
        'error': 'Demo Data',
        'connecting': 'Connecting...'
      }[this.apiStatus]
    }
  },
  async mounted() {
    await this.loadCryptoData()
    
    // Update data setiap 45 detik
    this.updateInterval = setInterval(() => {
      this.loadCryptoData()
    }, 45000)
  },
  beforeUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
  },
  methods: {
    async loadCryptoData() {
      this.isLoading = true
      this.apiStatus = 'connecting'
      
      try {
        // Ambil data harga saat ini
        const currentData = await fetchCryptoData(this.selectedCrypto)
        
        // Cek jika data adalah fallback
        this.apiStatus = currentData.market_data ? 'connected' : 'error'
        
        const selectedCryptoObj = this.cryptoList.find(c => c.id === this.selectedCrypto)
        const cryptoColor = selectedCryptoObj ? selectedCryptoObj.color : '#007bff'
        
        this.selectedCryptoInfo = {
          name: currentData.name,
          symbol: currentData.symbol.toUpperCase(),
          price: currentData.market_data?.current_price?.usd || (Math.random() * 50000 + 1000),
          change24h: currentData.market_data?.price_change_percentage_24h || (Math.random() * 20 - 10),
          marketCap: currentData.market_data?.market_cap?.usd || (Math.random() * 1000000000000),
          volume24h: currentData.market_data?.total_volume?.usd || (Math.random() * 50000000000),
          high24h: currentData.market_data?.high_24h?.usd || (Math.random() * 60000 + 1000),
          low24h: currentData.market_data?.low_24h?.usd || (Math.random() * 40000 + 1000)
        }
        
        // Update chart color berdasarkan crypto
        this.chartData.datasets[0].borderColor = cryptoColor
        this.chartData.datasets[0].backgroundColor = this.hexToRgba(cryptoColor, 0.1)
        this.chartData.datasets[0].pointBackgroundColor = cryptoColor
        
        // Ambil data historis untuk grafik
        const historyData = await getOptimalHistoryData(this.selectedCrypto, this.selectedPeriod)
        
        // Format data untuk chart
        this.formatChartData(historyData.prices)

        // Update waktu terakhir setiap detik
        setInterval(() => {
          this.lastUpdateTime = new Date().toLocaleTimeString()
        }, 1000)
        
      } catch (error) {
        console.error('Error loading crypto data:', error)
        this.apiStatus = 'error'
        
        // Data fallback
        if (!this.selectedCryptoInfo) {
          const selectedCryptoObj = this.cryptoList.find(c => c.id === this.selectedCrypto)
          const cryptoColor = selectedCryptoObj ? selectedCryptoObj.color : '#007bff'
          
          this.selectedCryptoInfo = {
            name: selectedCryptoObj?.name || this.selectedCrypto,
            symbol: selectedCryptoObj?.symbol || this.selectedCrypto.slice(0, 3).toUpperCase(),
            price: Math.random() * 50000 + 1000,
            change24h: (Math.random() * 20) - 10,
            marketCap: Math.random() * 1000000000000,
            volume24h: Math.random() * 50000000000,
            high24h: Math.random() * 60000 + 1000,
            low24h: Math.random() * 40000 + 1000
          }
          
          // Update chart color
          this.chartData.datasets[0].borderColor = cryptoColor
          this.chartData.datasets[0].backgroundColor = this.hexToRgba(cryptoColor, 0.1)
          this.chartData.datasets[0].pointBackgroundColor = cryptoColor
          
          // Generate fallback chart data
          this.generateFallbackChartData()
        }
        
        this.lastUpdateTime = new Date().toLocaleTimeString() + ' (Demo)'
      } finally {
        this.isLoading = false
      }
    },
    
    formatChartData(prices) {
      if (!prices || prices.length === 0) {
        this.generateFallbackChartData()
        return
      }

      // Ambil data points berdasarkan periode
      let dataPoints = prices
      const maxPoints = 50
      
      if (dataPoints.length > maxPoints) {
        // Sample data untuk performa
        const step = Math.ceil(dataPoints.length / maxPoints)
        dataPoints = dataPoints.filter((_, index) => index % step === 0)
      }
      
      this.chartData.labels = dataPoints.map((item) => {
        const date = new Date(item[0])
        
        if (this.selectedPeriod === '1d') {
          return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        } else {
          return date.toLocaleDateString([], {month: 'short', day: 'numeric'})
        }
      })
      
      this.chartData.datasets[0].data = dataPoints.map(item => item[1])
    },
    
    generateFallbackChartData() {
      const basePrice = this.selectedCryptoInfo?.price || 30000
      const dataPoints = 24
      const labels = []
      const data = []
      
      const now = new Date()
      
      for (let i = dataPoints - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - (i * 60 * 60 * 1000))
        labels.push(time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))
        
        // Generate realistic price movement
        const volatility = (Math.random() - 0.5) * basePrice * 0.02
        const price = basePrice + volatility + (i * basePrice * 0.001)
        data.push(price)
      }
      
      this.chartData.labels = labels
      this.chartData.datasets[0].data = data
    },
    
    async selectCrypto(cryptoId) {
      this.selectedCrypto = cryptoId
      await this.loadCryptoData()
    },
    
    async changeTimePeriod(period) {
      this.selectedPeriod = period
      await this.loadCryptoData()
    },
    
    formatNumber(num) {
      if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B'
      }
      if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M'
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K'
      }
      return num.toFixed(2)
    },
    
    hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }
}
</script>

<style>
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --card-bg: rgba(255, 255, 255, 0.1);
  --card-border: rgba(255, 255, 255, 0.2);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
}

* {
  box-sizing: border-box;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Modern Header */
.modern-header {
  background: var(--primary-gradient);
  padding: 2rem 0;
  border-radius: 0 0 2rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.modern-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.1;
}

/* Modern Cards */
.modern-card {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--card-border);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.card-header-modern {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid var(--card-border);
  padding: 1.25rem 1.5rem;
}

.card-title-modern {
  color: var(--text-primary);
  font-weight: 600;
  margin: 0;
}

.card-body-modern {
  padding: 1.5rem;
}

/* Chart Section */
.chart-section {
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.current-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.price-change {
  font-size: 1rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
}

.price-change.positive {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.price-change.negative {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Time Period Buttons */
.time-periods .btn-group {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 0.25rem;
}

.period-btn {
  border: none;
  border-radius: 0.75rem !important;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.period-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

.period-btn.active {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Crypto Details */
.crypto-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.detail-item .value {
  color: var(--text-primary);
  font-weight: 600;
}

/* Market Stats */
.market-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
}

.stat-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner-modern {
  text-align: center;
}

.spinner-circle {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Placeholder */
.placeholder-icon {
  font-size: 3rem;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .modern-header {
    border-radius: 0 0 1rem 1rem;
    padding: 1.5rem 0;
  }
  
  .price-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .market-stats {
    grid-template-columns: 1fr;
  }
  
  .card-body-modern {
    padding: 1rem;
  }
}
</style>