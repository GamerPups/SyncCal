import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function GlobalSearchBar() {
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = (formData.get('search') as string)?.trim()
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    } else {
      navigate('/search')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-b border-border px-4 py-2 sm:px-6 lg:px-8"
      role="search"
    >
      <div className="relative mx-auto max-w-2xl">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          name="search"
          type="search"
          placeholder="Search events..."
          className="h-9 pl-9 text-sm"
          aria-label="Search calendar events"
        />
      </div>
    </form>
  )
}
