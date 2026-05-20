class CryptoService {
  /**
   * Fetches real-time market data (price, 24h change, 7d sparkline arrays) from CoinGecko.
   * Leverages high-fidelity mock configurations if CoinGecko returns rate limits (429) or is slow.
   */
  async getCryptoTelemetry() {
    try {
      const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&order=market_cap_desc&per_page=3&page=1&sparkline=true'
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      })

      if (response.status === 429) {
        console.warn('[Crypto Service] CoinGecko returned 429 (Rate Limited). Falling back to mock feed.')
        return this.generateMockCrypto()
      }

      if (!response.ok) {
        throw new Error(`CoinGecko responded with status: ${response.status}`)
      }

      const rawData = await response.json()
      
      const mapped = rawData.map(coin => {
        // Extract sparkline prices (limit to last 24 items/hours for a sleek compact widget trend)
        const allPrices = coin.sparkline_in_7d?.price || []
        const trendData = allPrices.slice(-24).map((price, idx) => ({
          hour: idx,
          price: parseFloat(price.toFixed(2))
        }))

        return {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          image: coin.image,
          price: coin.current_price,
          change24h: parseFloat((coin.price_change_percentage_24h || 0).toFixed(2)),
          sparkline: trendData,
          isMock: false
        }
      })

      return {
        success: true,
        data: mapped,
        isMock: false
      }
    } catch (error) {
      console.warn('[Crypto Service] Remote query failed. Falling back to mocks. Error:', error.message)
      return this.generateMockCrypto()
    }
  }

  /**
   * Generates highly realistic real-time mock data for Bitcoin, Ethereum, and Solana.
   */
  generateMockCrypto() {
    // Generate realistic fluctuating prices
    const btcBase = 92450
    const ethBase = 3120
    const solBase = 184.50

    // Random fluctuations within 0.1% for realistic ticks
    const btcPrice = btcBase + (Math.random() - 0.5) * 50
    const ethPrice = ethBase + (Math.random() - 0.5) * 5
    const solPrice = solBase + (Math.random() - 0.5) * 0.4

    return {
      success: true,
      data: [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          price: parseFloat(btcPrice.toFixed(2)),
          change24h: 2.45,
          sparkline: this.generateSparkline(btcBase, 24, 200),
          isMock: true
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          price: parseFloat(ethPrice.toFixed(2)),
          change24h: -1.15,
          sparkline: this.generateSparkline(ethBase, 24, 15),
          isMock: true
        },
        {
          id: 'solana',
          name: 'Solana',
          symbol: 'SOL',
          price: parseFloat(solPrice.toFixed(2)),
          change24h: 5.84,
          sparkline: this.generateSparkline(solBase, 24, 3),
          isMock: true
        }
      ],
      isMock: true
    }
  }

  /**
   * Helper to generate a realistic sparkline data array for Recharts rendering.
   */
  generateSparkline(baseValue, count = 24, volatility = 5) {
    const arr = []
    let current = baseValue - (volatility * count) / 2
    for (let i = 0; i < count; i++) {
      current += (Math.random() - 0.4) * volatility // slightly trending up
      arr.push({ hour: i, price: parseFloat(current.toFixed(2)) })
    }
    return arr
  }
}

export const cryptoService = new CryptoService()
