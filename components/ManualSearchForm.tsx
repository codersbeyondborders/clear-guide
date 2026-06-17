'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

const DEMO_MAKES = ['BrewTech', 'AudioSync', 'TechHome', 'PowerTools Co.', 'Other']

export function ManualSearchForm() {
  const router = useRouter()
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [serial, setSerial] = useState('')
  const [touched, setTouched] = useState({ make: false, model: false })

  const isValid = make.trim().length > 0 && model.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ make: true, model: true })
    if (!isValid) return
    // In production: call /api/manuals/search?make=...&model=...&serial=...
    // For demo: any valid search loads the coffee maker manual
    router.push('/manual/demo-qr-123')
  }

  const inputClass = (hasError: boolean) =>
    `w-full h-11 px-4 rounded-lg text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
      hasError
        ? 'border-destructive bg-card text-foreground'
        : 'border-border bg-card text-foreground placeholder:text-muted-foreground'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label="Search for a product manual">
      {/* Make */}
      <div>
        <label htmlFor="search-make" className="block text-sm font-medium text-foreground mb-1.5">
          Manufacturer / Make <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="search-make"
          list="make-suggestions"
          value={make}
          onChange={e => setMake(e.target.value)}
          onBlur={() => setTouched(prev => ({ ...prev, make: true }))}
          placeholder="e.g. BrewTech"
          required
          aria-required="true"
          aria-describedby={touched.make && !make.trim() ? 'make-error' : undefined}
          className={inputClass(touched.make && !make.trim())}
        />
        <datalist id="make-suggestions">
          {DEMO_MAKES.map(m => <option key={m} value={m} />)}
        </datalist>
        {touched.make && !make.trim() && (
          <p id="make-error" className="mt-1 text-xs text-destructive" role="alert">
            Manufacturer is required.
          </p>
        )}
      </div>

      {/* Model */}
      <div>
        <label htmlFor="search-model" className="block text-sm font-medium text-foreground mb-1.5">
          Model <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="search-model"
          value={model}
          onChange={e => setModel(e.target.value)}
          onBlur={() => setTouched(prev => ({ ...prev, model: true }))}
          placeholder="e.g. Smart Coffee Maker X1"
          required
          aria-required="true"
          aria-describedby={touched.model && !model.trim() ? 'model-error' : undefined}
          className={inputClass(touched.model && !model.trim())}
        />
        {touched.model && !model.trim() && (
          <p id="model-error" className="mt-1 text-xs text-destructive" role="alert">
            Model is required.
          </p>
        )}
      </div>

      {/* Serial number (optional) */}
      <div>
        <label htmlFor="search-serial" className="block text-sm font-medium text-foreground mb-1.5">
          Serial Number <span className="text-xs text-muted-foreground">(optional)</span>
        </label>
        <input
          id="search-serial"
          value={serial}
          onChange={e => setSerial(e.target.value)}
          placeholder="e.g. SN-123456"
          className={inputClass(false)}
        />
      </div>

      <button
        type="submit"
        className="btn-primary w-full gap-2 py-3"
        aria-label="Search for product manual"
      >
        <Search className="w-4 h-4" aria-hidden="true" />
        Find Manual
      </button>

      <p className="text-xs text-center text-muted-foreground">
        Any search will load a sample manual in this demo.
      </p>
    </form>
  )
}
