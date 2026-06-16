'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import { useState } from 'react';

export default function EndUserPortal() {
  const router = useRouter();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (make.trim() && model.trim() && serialNumber.trim()) {
      router.push('/manual/demo-qr-123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:border-emerald-400 hover:text-emerald-600 transition-colors"
            aria-label="Go back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-xl font-bold text-emerald-600">ClearGuide</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold text-slate-900">Find Your Guide</h1>
            <p className="text-slate-500 mt-2 text-sm">Scan your product QR code or search manually.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center space-y-5">
            <div className="w-40 h-40 mx-auto rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400"></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Scan QR Code</h2>
              <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                Scan the code on your product packaging to instantly open the accessible guide.
              </p>
            </div>
            <button
              onClick={() => router.push('/manual/demo-qr-123')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-full text-sm transition-colors flex items-center justify-center gap-2"
            >
              Scan
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Or</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Enter Product Details</h2>
              <p className="text-slate-500 text-sm mt-1">Find your manual using device information.</p>
            </div>
            <form onSubmit={handleSearch} className="space-y-4">
              {[
                { label: 'Make (Manufacturer)', value: make, setter: setMake, placeholder: 'e.g. BrewTech', ariaLabel: 'Product Make' },
                { label: 'Model', value: model, setter: setModel, placeholder: 'e.g. Smart Coffee Maker X1', ariaLabel: 'Product Model' },
                { label: 'Serial Number', value: serialNumber, setter: setSerialNumber, placeholder: 'e.g. 123456789', ariaLabel: 'Serial Number' },
              ].map(({ label, value, setter, placeholder, ariaLabel }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                  <input
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    aria-label={ariaLabel}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={!make.trim() || !model.trim() || !serialNumber.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-full text-sm transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <Search className="w-4 h-4" />
                Search Guide
              </button>
              <p className="text-xs text-center text-slate-400">
                * For this demo, any search will load a sample manual.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
