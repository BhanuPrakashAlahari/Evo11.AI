import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Resolve __dirname in ES module configuration
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables relative to this configuration file's location (always targets backEnd/.env)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL ? process.env.CLIENT_URL.trim().replace(/\/+$/, '') : 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
  githubUsername: process.env.GITHUB_USERNAME || 'BhanuPrakashAlahari',
  githubToken: process.env.GITHUB_TOKEN,
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  newsApiKey: process.env.NEWS_API_KEY,
  mongoUri: process.env.MONGODB_URI
}
