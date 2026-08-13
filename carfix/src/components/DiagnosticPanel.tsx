import { useState, useEffect, useCallback } from 'react'
import { Search, AlertTriangle, Wrench, DollarSign, Package, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { lookupDiagnosticCode, searchDiagnosticCodes, PART_LABELS } from '@/lib/diagnostics'
import type { Car, DiagnosticCodeInfo, CarPart } from '@/types'
import { cn } from '@/lib/utils'

interface DiagnosticPanelProps {
  car: Car
  onAddDiagnostic: (info: DiagnosticCodeInfo) => Promise<void>
  onRemoveDiagnostic: (diagId: string) => Promise<void>
  onHighlightChange: (parts: CarPart[]) => void
}

const SEVERITY_COLORS = {
  low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  medium: 'bg-orange-100 text-orange-800 border-orange-200',
  high: 'bg-red-100 text-red-800 border-red-200',
  critical: 'bg-red-200 text-red-900 border-red-300',
}

const DIFFICULTY_LABELS = {
  easy: 'Easy — DIY friendly',
  moderate: 'Moderate — Some experience needed',
  hard: 'Hard — Advanced DIY or shop',
  professional: 'Professional — Specialist required',
}

export function DiagnosticPanel({ car, onAddDiagnostic, onRemoveDiagnostic, onHighlightChange }: DiagnosticPanelProps) {
  const [codeInput, setCodeInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCode, setSelectedCode] = useState<DiagnosticCodeInfo | null>(null)
  const [searchResults, setSearchResults] = useState<DiagnosticCodeInfo[]>([])
  const [adding, setAdding] = useState(false)
  const [activeTab, setActiveTab] = useState<'lookup' | 'saved'>('lookup')

  useEffect(() => {
    setSearchResults(searchDiagnosticCodes(searchQuery))
  }, [searchQuery])

  useEffect(() => {
    const parts = car.diagnostics.map((d) => d.affectedPart)
    if (selectedCode) parts.push(selectedCode.affectedPart)
    onHighlightChange([...new Set(parts)])
  }, [car.diagnostics, selectedCode, onHighlightChange])

  const handleLookup = useCallback(() => {
    const result = lookupDiagnosticCode(codeInput)
    if (result) setSelectedCode(result)
  }, [codeInput])

  const handleAdd = async () => {
    if (!selectedCode) return
    setAdding(true)
    try {
      await onAddDiagnostic(selectedCode)
      setSelectedCode(null)
      setCodeInput('')
      setActiveTab('saved')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('lookup')}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            activeTab === 'lookup' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Code Lookup
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            activeTab === 'saved' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Saved Issues ({car.diagnostics.length})
        </button>
      </div>

      {activeTab === 'lookup' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="code">Enter OBD-II Error Code</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                placeholder="e.g. P0300, P0420, C0035"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                className="font-mono uppercase"
              />
              <Button onClick={handleLookup}>Look Up</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Or search by description</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="misfire, catalytic, lean..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {searchQuery && (
            <div className="max-h-40 overflow-y-auto rounded-md border border-border divide-y">
              {searchResults.slice(0, 8).map((code) => (
                <button
                  key={code.code}
                  onClick={() => setSelectedCode(code)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                >
                  <span className="font-mono font-semibold text-primary">{code.code}</span>
                  <span className="text-muted-foreground truncate">{code.description}</span>
                  <ChevronRight className="size-4 ml-auto shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          {selectedCode && (
            <DiagnosticDetail
              info={selectedCode}
              onAdd={handleAdd}
              adding={adding}
              onClose={() => setSelectedCode(null)}
            />
          )}
        </>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-3">
          {car.diagnostics.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No diagnostic codes saved yet. Look up a code to get started.
            </p>
          ) : (
            car.diagnostics.map((diag) => (
              <div key={diag.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-lg text-primary">{diag.code}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border', SEVERITY_COLORS[diag.severity])}>
                        {diag.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{diag.description}</p>
                    <p className="text-xs text-accent-foreground mt-1">
                      Affected: {PART_LABELS[diag.affectedPart]}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveDiagnostic(diag.id)}
                    className="shrink-0"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Wrench className="size-4 mt-0.5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">Fix Steps</p>
                      <ol className="list-decimal list-inside text-muted-foreground space-y-1 mt-1">
                        {diag.fixSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Package className="size-4 mt-0.5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">Parts Needed</p>
                      <p className="text-muted-foreground">{diag.partsNeeded.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="size-3" />
                      {diag.estimatedCost}
                    </span>
                    <span>{DIFFICULTY_LABELS[diag.difficulty]}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function DiagnosticDetail({
  info,
  onAdd,
  adding,
  onClose,
}: {
  info: DiagnosticCodeInfo
  onAdd: () => void
  adding: boolean
  onClose: () => void
}) {
  return (
    <div className="rounded-lg border-2 border-primary/30 bg-accent/30 p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xl text-primary">{info.code}</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full border', SEVERITY_COLORS[info.severity])}>
              {info.severity}
            </span>
          </div>
          <p className="text-sm mt-1">{info.description}</p>
          <p className="text-xs text-accent-foreground mt-1 flex items-center gap-1">
            <AlertTriangle className="size-3" />
            Highlights: {PART_LABELS[info.affectedPart]} on 3D model
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      {info.commonCauses.length > 0 && (
        <div>
          <p className="text-sm font-medium">Common Causes</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
            {info.commonCauses.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-sm font-medium flex items-center gap-1">
          <Wrench className="size-4" /> Exact Fix Steps
        </p>
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1.5 mt-2">
          {info.fixSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="font-medium flex items-center gap-1">
            <Package className="size-4" /> Parts Needed
          </p>
          <p className="text-muted-foreground mt-1">{info.partsNeeded.join(', ')}</p>
        </div>
        <div>
          <p className="font-medium flex items-center gap-1">
            <DollarSign className="size-4" /> Est. Cost
          </p>
          <p className="text-muted-foreground mt-1">{info.estimatedCost}</p>
          <p className="text-xs text-muted-foreground mt-2">{DIFFICULTY_LABELS[info.difficulty]}</p>
        </div>
      </div>

      <Button onClick={onAdd} disabled={adding} className="w-full">
        {adding ? 'Saving...' : 'Save to This Car'}
      </Button>
    </div>
  )
}
