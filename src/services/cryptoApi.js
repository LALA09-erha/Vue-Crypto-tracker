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

// Fallback data untuk ketika API down
const fallbackData = {
    bitcoin: {
        name: 'Bitcoin',
        symbol: 'btc',
        price: 34789.23,
        change24h: 2.34,
        marketCap: 680456789123,
        volume24h: 23456789012,
        high24h: 35234.56,
        low24h: 34567.89
    },
    ethereum: {
        name: 'Ethereum',
        symbol: 'eth',
        price: 1856.78,
        change24h: -1.23,
        marketCap: 223456789012,
        volume24h: 12345678901,
        high24h: 1890.12,
        low24h: 1845.67
    },
    cardano: {
        name: 'Cardano',
        symbol: 'ada',
        price: 0.45,
        change24h: 0.56,
        marketCap: 15678901234,
        volume24h: 456789012,
        high24h: 0.47,
        low24h: 0.44
    },
    dogecoin: {
        name: 'Dogecoin',
        symbol: 'doge',
        price: 0.078,
        change24h: 3.45,
        marketCap: 11123456789,
        volume24h: 567890123,
        high24h: 0.079,
        low24h: 0.076
    },
    solana: {
        name: 'Solana',
        symbol: 'sol',
        price: 98.76,
        change24h: -2.34,
        marketCap: 41234567890,
        volume24h: 2345678901,
        high24h: 102.34,
        low24h: 97.65
    },
    ripple: {
        name: 'Ripple',
        symbol: 'xrp',
        price: 0.67,
        change24h: 1.23,
        marketCap: 36123456789,
        volume24h: 1678901234,
        high24h: 0.68,
        low24h: 0.66
    },
    polkadot: {
        name: 'Polkadot',
        symbol: 'dot',
        price: 4.56,
        change24h: -0.78,
        marketCap: 56789012345,
        volume24h: 345678901,
        high24h: 4.67,
        low24h: 4.52
    }
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
        const fallback = fallbackData[cryptoId] || fallbackData.bitcoin

        return {
            id: cryptoId,
            name: fallback.name,
            symbol: fallback.symbol,
            market_data: {
                current_price: {
                    usd: fallback.price
                },
                price_change_percentage_24h: fallback.change24h,
                market_cap: {
                    usd: fallback.marketCap
                },
                total_volume: {
                    usd: fallback.volume24h
                },
                high_24h: {
                    usd: fallback.high24h
                },
                low_24h: {
                    usd: fallback.low24h
                }
            }
        }
    }
}

export const fetchCryptoHistory = async (cryptoId, days = 7) => {
    const cacheKey = `history-${cryptoId}-${days}`

    // Cek cache terlebih dahulu
    if (cache.history[cacheKey] && isCacheValid(cacheKey, 'history')) {
        return cache.history[cacheKey]
    }

    try {
        const response = await axios.get(
            `${BASE_URL}/coins/${cryptoId}/market_chart`,
            {
                params: {
                    vs_currency: 'usd',
                    days: days
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
        const basePrice = fallbackData[cryptoId]?.price || 30000
        const prices = []
        const now = Date.now()
        const dataPoints = days === 1 ? 24 : (days === 7 ? 168 : 90)

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

    return await fetchCryptoHistory(cryptoId, days)
}