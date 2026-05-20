import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Resolve __dirname in ES module configuration
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables relative to this configuration file's location (always targets backEnd/.env)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  githubUsername: process.env.GITHUB_USERNAME || 'BhanuPrakashAlahari',
  newsApiKey: process.env.NEWS_API_KEY || '',
  mongoUri: process.env.MONGODB_URI || ''
}
