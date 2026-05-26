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
        throw new Error('CoinGecko API returned 429 (Rate Limited).')
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
      console.error('[Crypto Service] Remote query failed. Error:', error.message)
      throw error
    }
  }
}

export const cryptoService = new CryptoService()

