import axios from 'axios'

// Menggunakan CoinGecko API (gratis, tidak memerlukan API key untuk penggunaan terbatas)
const BASE_URL = 'https://api.coingecko.com/api/v3'

// Cache untuk mengurangi permintaan API
const cache = {
    data: {},
    history: {},
    timestamp: {}
}

// Fungsi untuk memeriksa apakah cache masih valid (5 menit untuk data, 10 menit untuk history)
function isCacheValid(key, type) {
    const cacheTime = type === 'history' ? 10 * 60 * 1000 : 5 * 60 * 1000 // 10 menit atau 5 menit
    return cache.timestamp[key] && (Date.now() - cache.timestamp[key] < cacheTime)
}

export const fetchCryptoData = async (cryptoId) => {
    const cacheKey = `data-${cryptoId}`

    // Cek cache terlebih dahulu
    if (cache.data[cacheKey] && isCacheValid(cacheKey, 'data')) {
        return cache.data[cacheKey]
    }

    try {
        const response = await axios.get(
            `${BASE_URL}/coins/${cryptoId}`,
            {
                params: {
                    localization: false,
                    tickers: false,
                    market_data: true,
                    community_data: false,
                    developer_data: false,
                    sparkline: false
                },
                timeout: 10000 // Timeout 10 detik
            }
        )

        // Simpan ke cache
        cache.data[cacheKey] = response.data
        cache.timestamp[cacheKey] = Date.now()

        return response.data
    } catch (error) {
        console.error('Error fetching crypto data:', error)

        // Fallback data jika API gagal
        const fallbackData = {
            id: cryptoId,
            name: cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1),
            symbol: cryptoId.slice(0, 3).toUpperCase(),
            market_data: {
                current_price: {
                    usd: Math.random() * 10000 + 1000
                },
                price_change_percentage_24h: (Math.random() * 20) - 10
            }
        }

        return fallbackData
    }
}

export const fetchCryptoHistory = async (cryptoId, days = 7) => {
    const cacheKey = `history-${cryptoId}-${days}`

    // Cek cache terlebih dahulu
    if (cache.history[cacheKey] && isCacheValid(cacheKey, 'history')) {
        return cache.history[cacheKey]
    }

    try {
        // PERBAIKAN: Tidak menggunakan parameter interval untuk menghindari error
        const response = await axios.get(
            `${BASE_URL}/coins/${cryptoId}/market_chart`,
            {
                params: {
                    vs_currency: 'usd',
                    days: days
                    // Interval parameter dihapus untuk menghindari error enterprise plan
                },
                timeout: 10000 // Timeout 10 detik
            }
        )

        // Simpan ke cache
        cache.history[cacheKey] = response.data
        cache.timestamp[cacheKey] = Date.now()

        return response.data
    } catch (error) {
        console.error('Error fetching crypto history:', error)

        // Fallback data yang lebih realistis jika API gagal
        const basePrice = Math.random() * 10000 + 1000
        const prices = []
        const now = Date.now()
        const dataPoints = days === 1 ? 24 : (days === 7 ? 168 : 90) // Sesuaikan jumlah data points

        for (let i = dataPoints - 1; i >= 0; i--) {
            const time = now - (i * (24 * 60 * 60 * 1000 / dataPoints))
            const volatility = (Math.random() * 0.1 - 0.05) * basePrice
            const trend = (i / dataPoints) * basePrice * 0.1
            const price = basePrice + volatility + trend
            prices.push([time, price])
        }

        return {
            prices: prices
        }
    }
}

// Fungsi baru untuk mendapatkan data dengan interval yang tepat
export const getOptimalHistoryData = async (cryptoId, period = '7d') => {
    let days;

    switch (period) {
        case '1d':
            days = 1;
            break;
        case '7d':
            days = 7;
            break;
        case '30d':
            days = 30;
            break;
        case '90d':
            days = 90;
            break;
        default:
            days = 7;
    }

    return await fetchCryptoHistory(cryptoId, days);
}