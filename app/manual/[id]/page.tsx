'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AIChatSupport } from '@/components/viewer/AIChatSupport';

interface ManualSection {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  audioDescription?: string;
}

interface Manual {
  id: string;
  productName: string;
  manufacturer: string;
  sections: ManualSection[];
}

export default function ManualViewPage() {
  const router = useRouter();
  const params = useParams();
  const manualId = params.id as string;
  const [manual, setManual] = useState<Manual | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const fetchManual = async () => {
      try {
        const res = await fetch(`/api/manuals/${manualId}`);
        if (res.ok) {
          setManual(await res.json());
        }
      } catch (error) {
        console.error('Failed to load manual:', error);
      } finally {
        setLoading(false);
      }
    };

    if (manualId) {
      fetchManual();
    }
  }, [manualId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <p className="text-slate-400">Loading manual...</p>
      </div>
    );
  }

  if (!manual) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
        <p className="text-red-500">Failed to load manual</p>
        <button onClick={() => router.push('/user')} className="text-sm text-emerald-600 underline">Go back</button>
      </div>
    );
  }

  const currentSection = manual.sections[activeSection];
  const baseClass = highContrast ? 'bg-black text-yellow-400' : 'bg-white text-slate-900';

  return (
    <div className={`min-h-screen ${baseClass} flex flex-col`}>
      <header className={`${highContrast ? 'bg-gray-900 border-yellow-400' : 'bg-white border-slate-100'} border-b sticky top-0 z-20`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/user')}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${highContrast ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' : 'border-slate-200 hover:border-emerald-400 hover:text-emerald-600'}`}
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold">{manual.productName}</h1>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${highContrast ? 'bg-yellow-400 text-black' : 'bg-slate-100 text-slate-900'}`}
          >
            {highContrast ? 'Normal Mode' : 'High Contrast'}
          </button>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-4 gap-4 max-w-6xl mx-auto w-full p-6">
        <div className={`lg:col-span-3 rounded-2xl border ${highContrast ? 'bg-gray-900 border-yellow-400' : 'bg-white border-slate-100'} p-6 shadow-sm`}>
          {currentSection ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">{currentSection.title}</h2>
              <p className={`text-base leading-relaxed whitespace-pre-line ${highContrast ? 'text-yellow-300' : 'text-slate-700'}`}>
                {currentSection.content}
              </p>
              {currentSection.audioDescription && (
                <div className={`mt-4 p-4 rounded-xl ${highContrast ? 'bg-gray-800 border border-yellow-400' : 'bg-slate-50 border border-slate-200'}`}>
                  <p className="text-xs font-semibold mb-2 opacity-60">Audio Description</p>
                  <p className={`text-sm ${highContrast ? 'text-yellow-300' : 'text-slate-600'}`}>
                    {currentSection.audioDescription}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p>No sections available</p>
          )}
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className={`rounded-2xl border ${highContrast ? 'bg-gray-900 border-yellow-400' : 'bg-white border-slate-100'} p-4 shadow-sm`}>
            <h3 className="font-bold mb-3">Sections</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {manual.sections.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(idx)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    idx === activeSection
                      ? highContrast ? 'bg-yellow-400 text-black font-semibold' : 'bg-emerald-50 text-emerald-700 font-semibold'
                      : highContrast ? 'hover:bg-gray-800 text-yellow-300' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="text-sm line-clamp-2">{section.title}</p>
                </button>
              ))}
            </div>
          </div>

          <AIChatSupport manualId={manualId} highContrast={highContrast} />
        </div>
      </div>
    </div>
  );
}
