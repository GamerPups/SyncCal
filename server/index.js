/**
 * Local Express API for SyncCal.
 * Run: npm run dev:server
 * Vite proxies /api → http://localhost:3001
 */
import { createApp } from './app.js'

const PORT = process.env.PORT ?? 3001
const app = createApp()

app.listen(PORT, () => {
  console.log(`SyncCal API running at http://localhost:${PORT}`)
})
