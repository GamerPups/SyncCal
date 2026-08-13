import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { CarDetailPage } from '@/pages/CarDetailPage'
import { Car } from 'lucide-react'
import { Link } from 'react-router-dom'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Car className="size-4 text-primary-foreground" />
            </div>
            CarFix
          </Link>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            3D Diagnostics · Repair Guide · Messaging
          </span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/car/:id" element={<CarDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
