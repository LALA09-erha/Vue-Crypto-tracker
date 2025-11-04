<template>
  <div class="chart-container">
    <canvas ref="chartCanvas" :width="width" :height="height"></canvas>
    <div v-if="isLoading" class="chart-loading">
      <div class="spinner"></div>
      <p>Loading chart data...</p>
    </div>
    <div v-else-if="!hasData" class="chart-no-data">
      <p>No chart data available</p>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'

export default {
  name: 'CryptoChart',
  props: {
    chartData: {
      type: Object,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chart: null,
      width: 800,
      height: 400
    }
  },
  computed: {
    hasData() {
      return this.chartData && 
             this.chartData.datasets && 
             this.chartData.datasets.length > 0 && 
             this.chartData.datasets[0].data.length > 0
    }
  },
  mounted() {
    this.initChart()
    this.setupResizeObserver()
  },
  beforeUnmount() {
    this.destroyChart()
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  },
  methods: {
    initChart() {
      if (!this.$refs.chartCanvas) {
        console.warn('Chart canvas not found')
        return
      }

      // Register Chart.js components
      Chart.register(...registerables)

      // Destroy existing chart
      this.destroyChart()

      const ctx = this.$refs.chartCanvas.getContext('2d')
      
      const options = {
        responsive: false, // We handle responsiveness manually
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                return `$${context.parsed.y.toFixed(2)}`
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              maxTicksLimit: 6
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: (value) => {
                if (value >= 1000000) {
                  return '$' + (value / 1000000).toFixed(1) + 'M'
                }
                if (value >= 1000) {
                  return '$' + (value / 1000).toFixed(1) + 'K'
                }
                return '$' + value
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        elements: {
          point: {
            radius: 0,
            hoverRadius: 4
          }
        },
        animation: {
          duration: 0 // Disable animations for better performance
        }
      }

      try {
        this.chart = new Chart(ctx, {
          type: 'line',
          data: this.chartData,
          options: options
        })
      } catch (error) {
        console.error('Error initializing chart:', error)
      }
    },

    destroyChart() {
      if (this.chart) {
        try {
          this.chart.destroy()
        } catch (error) {
          console.warn('Error destroying chart:', error)
        }
        this.chart = null
      }
    },

    setupResizeObserver() {
      // Simple resize handling without ResizeObserver for compatibility
      window.addEventListener('resize', this.handleResize)
      this.handleResize()
    },

    handleResize() {
      const container = this.$el
      if (container) {
        this.width = container.clientWidth
        this.height = container.clientHeight
        
        // Reinitialize chart on resize
        if (this.chart && this.hasData) {
          setTimeout(() => {
            this.chart.resize()
          }, 100)
        }
      }
    },

    updateChart() {
      if (!this.chart || !this.hasData) {
        this.initChart()
        return
      }

      try {
        this.chart.data = this.chartData
        this.chart.update('none') // Update without animation
      } catch (error) {
        console.error('Error updating chart:', error)
        // Reinitialize chart on error
        this.initChart()
      }
    }
  },
  watch: {
    chartData: {
      handler(newData) {
        if (newData && this.hasData) {
          this.$nextTick(() => {
            this.updateChart()
          })
        }
      },
      deep: true
    },
    isLoading() {
      if (this.chart) {
        // You can add loading state handling here if needed
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 400px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  overflow: hidden;
}

.chart-loading,
.chart-no-data {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  z-index: 10;
}

.chart-loading p,
.chart-no-data p {
  color: rgba(255, 255, 255, 0.8);
  margin-top: 12px;
  font-size: 14px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>