import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Save, Upload, FileText,
  Image, Video, X, CheckCircle2, Loader2, Sparkles, Globe, Share2, Download
} from 'lucide-react';
import logo from '../assets/logo.png';
import qrCode from '../assets/product-qrcode.png';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string; // object URL for preview
}

interface Section {
  id: string;
  title: string;
  content: string;
  media: MediaFile[];
}

interface Manual {
  id?: string;
  productName: string;
  productModel: string;
  make: string;
  serialNumber: string;
  manufacturer: string;
  status: string;
  sections: Section[];
}

type InputMode = 'upload' | 'manual' | null;

// ─── AI Processing overlay ───────────────────────────────────────────────────

const AI_STEPS = [
  'Parsing document structure...',
  'Extracting sections and headings...',
  'Generating accessibility metadata...',
  'Building AI knowledge base...',
  'Optimising for multimodal delivery...',
  'Finalising and publishing...',
];

function AIProcessingOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (step < AI_STEPS.length - 1) {
      const t = setTimeout(() => setStep(s => s + 1), 900);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setDone(true), 900);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (done) {
      // Don't auto-dismiss — user closes via the QR code panel
    }
  }, [done, onDone]);

  return (
    <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-10 w-full max-w-sm text-center space-y-6">
        {/* Icon */}
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-colors duration-500 ${done ? 'bg-emerald-500' : 'bg-emerald-50'}`}>
          {done
            ? <CheckCircle2 className="w-8 h-8 text-white" />
            : <Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" />
          }
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            {done ? 'Manual Ready!' : 'AI is Processing'}
          </h2>
          <p className="text-slate-500 text-sm">
            {done ? 'Your manual has been published successfully.' : 'Hang tight while we build your accessible manual.'}
          </p>
        </div>

        {/* QR Code — shown when done */}
        {done && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Scan to view manual</p>
            <img
              src={qrCode}
              alt="QR code to view manual"
              className="w-36 h-36 rounded-xl border border-slate-100 shadow-sm"
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'Manual QR Code', url: window.location.href });
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:border-emerald-400 hover:text-emerald-600 px-4 py-2 rounded-full transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <a
                href={qrCode}
                download="manual-qr-code.png"
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-full transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
            <button
              onClick={onDone}
              className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Steps */}
        {!done && (
          <div className="space-y-2.5 text-left">
            {AI_STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300 ${i < step ? 'text-emerald-600' : i === step ? 'text-slate-900 font-medium' : 'text-slate-300'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                  i < step ? 'bg-emerald-500' : i === step ? 'bg-emerald-100' : 'bg-slate-100'
                }`}>
                  {i < step
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    : i === step
                      ? <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />
                      : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 block" />
                  }
                </div>
                {s}
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {!done && (
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${((step + 1) / AI_STEPS.length) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── File upload drop zone ────────────────────────────────────────────────────

function DropZone({
  accept, label, hint, onFiles, multiple = false
}: {
  accept: string;
  label: string;
  hint: string;
  onFiles: (files: File[]) => void;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle = (files: FileList | null) => {
    if (files) onFiles(Array.from(files));
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files); }}
      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
        dragging ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
      }`}
    >
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => handle(e.target.files)} />
      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="text-xs text-slate-400 mt-1">{hint}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ManualEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [manual, setManual] = useState<Manual>({
    productName: '',
    productModel: '',
    make: '',
    serialNumber: '',
    manufacturer: 'BrewTech',
    status: 'Draft',
    sections: [],
  });
  const [loading, setLoading] = useState(!isNew);
  const [showProcessing, setShowProcessing] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>(null);
  const [uploadedManual, setUploadedManual] = useState<File | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);

  useEffect(() => {
    if (!isNew) fetchManual();
  }, [id]);

  const fetchManual = async () => {
    try {
      const res = await fetch(`/api/manuals/${id}`);
      if (!res.ok) throw new Error('Not found');
      setManual(await res.json());
    } catch {
      navigate('/manufacturer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setShowProcessing(true);
    // Actual save happens in background; overlay drives the UX
    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/manuals' : `/api/manuals/${id}`;
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manual),
      });
    } catch (error) {
      console.error('Failed to save manual', error);
    }
  };

  const handleProcessingDone = () => {
    setShowProcessing(false);
    navigate('/manufacturer/dashboard');
  };

  // Sections
  const addSection = () => {
    setManual(prev => ({
      ...prev,
      sections: [...prev.sections, { id: `s-${Date.now()}`, title: '', content: '', media: [] }],
    }));
  };

  const updateSection = (index: number, field: 'title' | 'content', value: string) => {
    const updated = [...manual.sections];
    updated[index] = { ...updated[index], [field]: value };
    setManual(prev => ({ ...prev, sections: updated }));
  };

  const removeSection = (index: number) => {
    const updated = [...manual.sections];
    updated.splice(index, 1);
    setManual(prev => ({ ...prev, sections: updated }));
  };

  const addMedia = (sectionIndex: number, files: File[], type: 'image' | 'video') => {
    const newMedia: MediaFile[] = files.map(f => ({
      id: `m-${Date.now()}-${Math.random()}`,
      name: f.name,
      type,
      url: URL.createObjectURL(f),
    }));
    const updated = [...manual.sections];
    updated[sectionIndex] = { ...updated[sectionIndex], media: [...updated[sectionIndex].media, ...newMedia] };
    setManual(prev => ({ ...prev, sections: updated }));
  };

  const removeMedia = (sectionIndex: number, mediaId: string) => {
    const updated = [...manual.sections];
    updated[sectionIndex] = {
      ...updated[sectionIndex],
      media: updated[sectionIndex].media.filter(m => m.id !== mediaId),
    };
    setManual(prev => ({ ...prev, sections: updated }));
  };

  const field = (label: string, key: keyof Manual, placeholder: string) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        value={manual[key] as string}
        onChange={(e) => setManual(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
      />
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;

  return (
    <>
      {showProcessing && <AIProcessingOverlay onDone={handleProcessingDone} />}

      <div className="min-h-screen bg-slate-50 font-sans pb-16">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/manufacturer/dashboard')}
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <img src={logo} alt="ClearGuide" className="h-8 w-auto" />
              <span className="text-slate-400 text-sm font-medium hidden sm:block">
                / {isNew ? 'Create Manual' : 'Edit Manual'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={manual.status}
                onChange={(e) => setManual(prev => ({ ...prev, status: e.target.value }))}
                className="border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Manual
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

          {/* ── Basic Information ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {field('Product Name', 'productName', 'e.g. Smart Coffee Maker X1')}
              {field('Product Model', 'productModel', 'e.g. SCM-X1-2024')}
              {field('Make (Brand)', 'make', 'e.g. BrewTech')}
              {field('Serial Number', 'serialNumber', 'e.g. BT-123456')}
            </div>
          </div>

          {/* ── Language Translations ── */}
          <LanguageTranslations
            selected={selectedLanguages}
            onChange={setSelectedLanguages}
          />

          {/* ── Input mode chooser ── */}
          {inputMode === null && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
              <h2 className="text-base font-semibold text-slate-900 mb-1">Add Manual Content</h2>
              <p className="text-slate-500 text-sm mb-6">Choose how you'd like to create this manual.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setInputMode('upload')}
                  className="group flex flex-col items-center gap-3 p-7 rounded-2xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-center"
                >
                  <div className="w-12 h-12 bg-emerald-50 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors">
                    <Upload className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Upload Manual</p>
                    <p className="text-slate-500 text-xs mt-1">Upload a PDF or Word doc — AI reads it automatically.</p>
                  </div>
                </button>
                <button
                  onClick={() => setInputMode('manual')}
                  className="group flex flex-col items-center gap-3 p-7 rounded-2xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-center"
                >
                  <div className="w-12 h-12 bg-emerald-50 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors">
                    <FileText className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Manual Sections</p>
                    <p className="text-slate-500 text-xs mt-1">Build the manual section by section yourself.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── Upload Manual ── */}
          {inputMode === 'upload' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Upload Manual</h2>
                  <p className="text-slate-500 text-xs mt-0.5">AI will parse and structure the content automatically.</p>
                </div>
                <button
                  onClick={() => { setInputMode(null); setUploadedManual(null); }}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Change method
                </button>
              </div>

              {!uploadedManual ? (
                <DropZone
                  accept=".pdf,.doc,.docx"
                  label="Drop your PDF or Word document here"
                  hint="Supports .pdf, .doc, .docx — up to 50 MB"
                  onFiles={(files) => setUploadedManual(files[0])}
                />
              ) : (
                <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{uploadedManual.name}</p>
                    <p className="text-xs text-slate-500">{(uploadedManual.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    onClick={() => setUploadedManual(null)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  After saving, our AI will extract sections, generate accessibility metadata, and build the AI chat knowledge base from your document.
                </p>
              </div>
            </div>
          )}

          {/* ── Manual Sections ── */}
          {inputMode === 'manual' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Manual Sections</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Build your manual section by section.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setInputMode(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                  >
                    Change method
                  </button>
                  <button
                    onClick={addSection}
                    className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-emerald-400 hover:text-emerald-600 text-slate-700 font-semibold px-4 py-2 rounded-full text-sm transition-colors bg-white"
                  >
                    <Plus className="w-4 h-4" /> Add Section
                  </button>
                </div>
              </div>

              {manual.sections.length === 0 ? (
                <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm">No sections yet. Click "Add Section" to start.</p>
                </div>
              ) : (
                manual.sections.map((section, index) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    index={index}
                    onUpdate={updateSection}
                    onRemove={removeSection}
                    onAddMedia={addMedia}
                    onRemoveMedia={removeMedia}
                  />
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// ─── Language Translations ───────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'es', label: 'Spanish',    flag: '🇪🇸' },
  { code: 'fr', label: 'French',     flag: '🇫🇷' },
  { code: 'de', label: 'German',     flag: '🇩🇪' },
  { code: 'it', label: 'Italian',    flag: '🇮🇹' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', label: 'Chinese',    flag: '🇨🇳' },
  { code: 'ja', label: 'Japanese',   flag: '🇯🇵' },
  { code: 'ar', label: 'Arabic',     flag: '🇸🇦' },
  { code: 'hi', label: 'Hindi',      flag: '🇮🇳' },
  { code: 'ko', label: 'Korean',     flag: '🇰🇷' },
  { code: 'nl', label: 'Dutch',      flag: '🇳🇱' },
  { code: 'pl', label: 'Polish',     flag: '🇵🇱' },
  { code: 'ru', label: 'Russian',    flag: '🇷🇺' },
  { code: 'tr', label: 'Turkish',    flag: '🇹🇷' },
  { code: 'sv', label: 'Swedish',    flag: '🇸🇪' },
];

function LanguageTranslations({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (langs: string[]) => void;
}) {
  const toggle = (code: string) => {
    if (code === 'en') return; // English is always required
    onChange(
      selected.includes(code)
        ? selected.filter(l => l !== code)
        : [...selected, code]
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            Language Translations
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Select languages to auto-translate this manual. English is always included.
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          selected.length > 1
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-slate-100 text-slate-500'
        }`}>
          {selected.length} language{selected.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {LANGUAGES.map(({ code, label, flag }) => {
          const isSelected = selected.includes(code);
          const isRequired = code === 'en';
          return (
            <button
              key={code}
              type="button"
              onClick={() => toggle(code)}
              disabled={isRequired}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                isSelected
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-slate-50'
              } ${isRequired ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
            >
              <span className="text-base leading-none">{flag}</span>
              <span className="truncate">{label}</span>
              {isRequired && (
                <span className="ml-auto text-xs text-emerald-600 font-semibold flex-shrink-0">✓</span>
              )}
              {isSelected && !isRequired && (
                <span className="ml-auto w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected.length > 1 && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700 leading-relaxed">
            AI will automatically translate all sections into{' '}
            <strong>{selected.filter(l => l !== 'en').map(c => LANGUAGES.find(l => l.code === c)?.label).join(', ')}</strong>{' '}
            when you save.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  section, index, onUpdate, onRemove, onAddMedia, onRemoveMedia
}: {
  key?: React.Key;
  section: Section;
  index: number;
  onUpdate: (i: number, field: 'title' | 'content', value: string) => void;
  onRemove: (i: number) => void;
  onAddMedia: (i: number, files: File[], type: 'image' | 'video') => void;
  onRemoveMedia: (i: number, mediaId: string) => void;
}) {
  const images = section.media.filter(m => m.type === 'image');
  const videos = section.media.filter(m => m.type === 'video');

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Section {index + 1}
        </span>
        <button
          onClick={() => onRemove(index)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Remove section"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Section Title</label>
        <input
          value={section.title}
          onChange={(e) => onUpdate(index, 'title', e.target.value)}
          placeholder="e.g. Getting Started"
          className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Text Content</label>
        <textarea
          value={section.content}
          onChange={(e) => onUpdate(index, 'content', e.target.value)}
          placeholder="Enter step-by-step instructions..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition min-h-[100px] resize-y"
        />
      </div>

      {/* Media uploads */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Images */}
        <div className="space-y-3">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Image className="w-4 h-4 text-slate-400" /> Images
          </label>
          <DropZone
            accept="image/*"
            label="Upload images"
            hint="PNG, JPG, WebP"
            multiple
            onFiles={(files) => onAddMedia(index, files, 'image')}
          />
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map(img => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => onRemoveMedia(index, img.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Videos */}
        <div className="space-y-3">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Video className="w-4 h-4 text-slate-400" /> Videos
          </label>
          <DropZone
            accept="video/*"
            label="Upload videos"
            hint="MP4, MOV, WebM"
            multiple
            onFiles={(files) => onAddMedia(index, files, 'video')}
          />
          {videos.length > 0 && (
            <div className="space-y-2">
              {videos.map(vid => (
                <div key={vid.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xs text-slate-700 truncate flex-1">{vid.name}</span>
                  <button
                    onClick={() => onRemoveMedia(index, vid.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
