import React, { useState, useEffect, useRef } from 'react';
import { AIChatSupport } from './AIChatSupport';
import {
  FileText, Video, MessageSquare, ZoomIn, ZoomOut, Contrast,
  ArrowLeft, Download, Mic, MicOff, Volume2, VolumeX,
  ChevronDown, FileDown, BookOpen, Play, LayoutTemplate, Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import infographic from '../../assets/Infographic.webp';
import step1 from '../../assets/step1.webp';
import step2 from '../../assets/step2.webp';
import step3 from '../../assets/step3.webp';
import productVideo from '../../assets/product-video.mp4';
import productVideo2 from '../../assets/product-video2.mp4';
import productVideo3 from '../../assets/product-video3.mp4';

// Section videos mapped by index
const SECTION_VIDEOS: Record<number, string> = { 0: productVideo, 1: productVideo2, 2: productVideo3 };

// Section images mapped by index
const SECTION_IMAGES: Record<number, string> = { 0: step1, 1: step2, 2: step3 };

// ─── Supported languages ──────────────────────────────────────────────────────

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

// ─── Language Picker dropdown ─────────────────────────────────────────────────

function LanguagePicker({
  value,
  onChange,
  hc,
  compact = false,
}: {
  value: string;
  onChange: (code: string) => void;
  hc: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.code === value) ?? LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const btnCls = hc
    ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'
    : 'border-slate-200 text-slate-700 hover:border-emerald-400 bg-white';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 border rounded-full transition-colors ${compact ? 'px-2.5 py-1.5' : 'px-3 py-2'} text-sm font-medium ${btnCls}`}
        aria-label="Select language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        {!compact && <span className="hidden sm:block">{current.label}</span>}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border shadow-xl overflow-hidden z-30 ${hc ? 'bg-gray-900 border-yellow-400' : 'bg-white border-slate-100'}`}>
          <div className={`px-3 py-2 border-b text-xs font-semibold ${hc ? 'border-yellow-900 text-yellow-500' : 'border-slate-100 text-slate-400'}`}>
            Select Language
          </div>
          <div className="max-h-64 overflow-y-auto">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { onChange(lang.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  lang.code === value
                    ? hc ? 'bg-yellow-400 text-black font-semibold' : 'bg-emerald-50 text-emerald-700 font-semibold'
                    : hc ? 'text-yellow-300 hover:bg-gray-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                {lang.label}
                {lang.code === value && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ManualSection {
  id: string;
  title: string;
  content: string;
  videoUrl: string;
  audioDescription: string;
}

interface Manual {
  id: string;
  productName: string;
  manufacturer: string;
  sections: ManualSection[];
}

type ViewMode = 'welcome' | 'text' | 'infographic' | 'video' | 'chat';

// ─── Welcome / Mode picker screen ─────────────────────────────────────────────

function WelcomeScreen({
  manual,
  onSelect,
  hc,
  language,
  onLanguageChange,
}: {
  manual: Manual;
  onSelect: (mode: ViewMode) => void;
  hc: boolean;
  language: string;
  onLanguageChange: (code: string) => void;
}) {
  const base = hc ? 'bg-black text-yellow-400' : 'bg-slate-50 text-slate-900';
  const card = hc
    ? 'bg-gray-900 border-yellow-400 hover:bg-gray-800'
    : 'bg-white border-slate-100 hover:border-emerald-400 hover:shadow-md';
  const iconBg = hc ? 'bg-yellow-400' : 'bg-emerald-50';
  const iconColor = hc ? 'text-black' : 'text-emerald-600';
  const sub = hc ? 'text-yellow-600' : 'text-slate-500';

  const modes: { mode: ViewMode; icon: React.ReactNode; label: string; desc: string }[] = [
    {
      mode: 'text',
      icon: <FileText className="w-6 h-6" />,
      label: 'Text with Images',
      desc: 'Read the manual with inline images and step-by-step instructions.',
    },
    {
      mode: 'infographic',
      icon: <LayoutTemplate className="w-6 h-6" />,
      label: 'Infographic',
      desc: 'Visual overview of the product in a single illustrated guide.',
    },
    {
      mode: 'video',
      icon: <Video className="w-6 h-6" />,
      label: 'Video',
      desc: 'Watch guided video walkthroughs for each section.',
    },
    {
      mode: 'chat',
      icon: <MessageSquare className="w-6 h-6" />,
      label: 'AI Chat',
      desc: 'Type or speak — ask questions and get answers with optional audio.',
    },
  ];

  return (
    <div className={`flex flex-col min-h-full ${base}`}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        {/* Product info */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 border ${hc ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
            <BookOpen className="w-3.5 h-3.5" /> Product Manual
          </div>
          <h1 className={`text-3xl font-bold mb-1 ${hc ? 'text-yellow-400' : 'text-slate-900'}`}>
            {manual.productName}
          </h1>
          <p className={`text-sm ${sub}`}>by {manual.manufacturer} · {manual.sections.length} sections</p>
        </div>

        {/* Language picker */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Globe className={`w-4 h-4 ${hc ? 'text-yellow-500' : 'text-slate-400'}`} />
          <span className={`text-sm ${hc ? 'text-yellow-500' : 'text-slate-500'}`}>View in:</span>
          <LanguagePicker value={language} onChange={onLanguageChange} hc={hc} />
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-2 gap-4 w-full mb-6">
          {modes.map(({ mode, icon, label, desc }) => (
            <button
              key={mode}
              onClick={() => onSelect(mode)}
              className={`flex flex-col items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all ${card}`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
                <span className={iconColor}>{icon}</span>
              </div>
              <div>
                <p className={`font-semibold text-sm ${hc ? 'text-yellow-400' : 'text-slate-900'}`}>{label}</p>
                <p className={`text-xs mt-0.5 leading-relaxed ${sub}`}>{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Download row */}
        <DownloadButton manual={manual} hc={hc} fullWidth />
      </div>
    </div>
  );
}

// ─── Download button with dropdown ───────────────────────────────────────────

function DownloadButton({
  manual,
  hc,
  fullWidth = false,
}: {
  manual: Manual;
  hc: boolean;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDownload = (format: 'pdf' | 'docx') => {
    // Generate a simple text blob as a stand-in for a real export
    const content = manual.sections
      .map(s => `${s.title}\n${'─'.repeat(40)}\n${s.content}`)
      .join('\n\n');
    const blob = new Blob([`${manual.productName}\n${'═'.repeat(40)}\n\n${content}`], {
      type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${manual.productName.replace(/\s+/g, '-')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const btnBase = hc
    ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'
    : 'border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-600 bg-white';

  return (
    <div ref={ref} className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-center gap-2 border rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${btnBase} ${fullWidth ? 'w-full' : ''}`}
      >
        <Download className="w-4 h-4" />
        Download
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className={`absolute bottom-full mb-2 left-0 right-0 rounded-2xl border shadow-xl overflow-hidden z-20 ${hc ? 'bg-gray-900 border-yellow-400' : 'bg-white border-slate-100'}`}>
          <button
            onClick={() => handleDownload('pdf')}
            className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors ${hc ? 'text-yellow-400 hover:bg-gray-800' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            <FileDown className="w-4 h-4 text-red-500" />
            Download PDF
          </button>
          <div className={`h-px ${hc ? 'bg-yellow-900' : 'bg-slate-100'}`} />
          <button
            onClick={() => handleDownload('docx')}
            className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors ${hc ? 'text-yellow-400 hover:bg-gray-800' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            <FileDown className="w-4 h-4 text-blue-500" />
            Download DOCX
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Audio Chat mode ──────────────────────────────────────────────────────────

function AudioChatMode({ manualId, hc }: { manualId: string; hc: boolean }) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const recognitionRef = useRef<any>(null);

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const supported = !!SpeechRecognition;

  const startListening = () => {
    if (!supported) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => { setStatus('listening'); setListening(true); };
    recognition.onresult = async (e: any) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      setStatus('thinking');
      setListening(false);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, manualId }),
        });
        const data = await res.json();
        setResponse(data.reply);
        setStatus('speaking');
        const utterance = new SpeechSynthesisUtterance(data.reply);
        utterance.onend = () => setStatus('idle');
        window.speechSynthesis.speak(utterance);
      } catch {
        setStatus('idle');
      }
    };
    recognition.onerror = () => { setStatus('idle'); setListening(false); };
    recognition.onend = () => { if (status === 'listening') setStatus('idle'); setListening(false); };
    recognition.start();
  };

  const stopAll = () => {
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    setStatus('idle');
    setListening(false);
  };

  const pulseColor = hc ? 'bg-yellow-400' : 'bg-emerald-500';
  const sub = hc ? 'text-yellow-600' : 'text-slate-400';
  const cardBg = hc ? 'bg-gray-900 border-yellow-400' : 'bg-slate-50 border-slate-100';

  const statusLabel = {
    idle: 'Tap the mic to ask a question',
    listening: 'Listening...',
    thinking: 'AI is thinking...',
    speaking: 'Speaking response...',
  }[status];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6 py-10">
      {/* Mic button */}
      <div className="relative flex items-center justify-center">
        {(status === 'listening' || status === 'speaking') && (
          <>
            <span className={`absolute w-32 h-32 rounded-full ${pulseColor} opacity-10 animate-ping`} />
            <span className={`absolute w-24 h-24 rounded-full ${pulseColor} opacity-20 animate-pulse`} />
          </>
        )}
        <button
          onClick={status === 'idle' ? startListening : stopAll}
          disabled={!supported || status === 'thinking'}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-40 ${
            status !== 'idle'
              ? hc ? 'bg-yellow-400 text-black' : 'bg-emerald-500 text-white'
              : hc ? 'bg-gray-900 border-2 border-yellow-400 text-yellow-400' : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600'
          }`}
          aria-label={status === 'idle' ? 'Start voice input' : 'Stop'}
        >
          {status === 'speaking'
            ? <Volume2 className="w-8 h-8" />
            : status !== 'idle'
              ? <MicOff className="w-8 h-8" />
              : <Mic className="w-8 h-8" />
          }
        </button>
      </div>

      {/* Status */}
      <p className={`text-sm font-medium ${hc ? 'text-yellow-400' : 'text-slate-600'}`}>{statusLabel}</p>

      {!supported && (
        <p className={`text-xs text-center ${sub}`}>
          Voice input is not supported in this browser. Try Chrome or Edge.
        </p>
      )}

      {/* Transcript / Response */}
      {(transcript || response) && (
        <div className="w-full max-w-md space-y-3">
          {transcript && (
            <div className={`rounded-2xl border p-4 ${cardBg}`}>
              <p className={`text-xs font-semibold mb-1 ${sub}`}>You said</p>
              <p className={`text-sm ${hc ? 'text-yellow-300' : 'text-slate-700'}`}>"{transcript}"</p>
            </div>
          )}
          {response && (
            <div className={`rounded-2xl border p-4 ${hc ? 'bg-yellow-400 border-yellow-400' : 'bg-emerald-50 border-emerald-100'}`}>
              <p className={`text-xs font-semibold mb-1 ${hc ? 'text-black' : 'text-emerald-700'}`}>AI Response</p>
              <p className={`text-sm leading-relaxed ${hc ? 'text-black' : 'text-emerald-900'}`}>{response}</p>
              <button
                onClick={() => {
                  window.speechSynthesis.cancel();
                  const u = new SpeechSynthesisUtterance(response);
                  u.onend = () => setStatus('idle');
                  setStatus('speaking');
                  window.speechSynthesis.speak(u);
                }}
                className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${hc ? 'text-black' : 'text-emerald-700'}`}
              >
                <Play className="w-3 h-3" /> Replay
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Viewer ──────────────────────────────────────────────────────────────

export function AccessibleManualViewer({ manualId }: { manualId: string }) {
  const navigate = useNavigate();
  const [manual, setManual] = useState<Manual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('welcome');
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const fetchManual = async () => {
      try {
        const res = await fetch(`/api/manuals/${manualId}`);
        if (!res.ok) throw new Error('Manual not found');
        setManual(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchManual();
  }, [manualId]);

  // Speak section content when TTS is on and section changes
  useEffect(() => {
    if (ttsEnabled && manual && viewMode === 'text') {
      window.speechSynthesis.cancel();
      const section = manual.sections[activeSection];
      if (section) {
        const u = new SpeechSynthesisUtterance(`${section.title}. ${section.content}`);
        window.speechSynthesis.speak(u);
      }
    } else {
      window.speechSynthesis.cancel();
    }
  }, [ttsEnabled, activeSection, viewMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-slate-400 text-sm">Loading manual...</div>
      </div>
    );
  }
  if (error || !manual) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
        <div className="text-red-500 text-sm">{error || 'Failed to load manual'}</div>
        <button onClick={() => navigate('/user')} className="text-sm text-emerald-600 underline">Go back</button>
      </div>
    );
  }

  const hc = highContrast;
  const currentSection = manual.sections[activeSection];
  const base = hc ? 'bg-black text-yellow-400' : 'bg-white text-slate-900';
  const border = hc ? 'border-yellow-400' : 'border-slate-100';
  const navActive = hc ? 'bg-yellow-400 text-black font-bold' : 'bg-emerald-50 text-emerald-700 font-semibold';
  const navHover = hc ? 'hover:bg-gray-900' : 'hover:bg-slate-50';
  const ctrlBtn = hc
    ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'
    : 'border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600';
  const bottomActive = hc ? 'text-yellow-400' : 'text-emerald-600';
  const bottomInactive = hc ? 'text-yellow-700' : 'text-slate-400';

  const navModes: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'text',        icon: <FileText className="w-5 h-5" />,       label: 'Text'        },
    { mode: 'infographic', icon: <LayoutTemplate className="w-5 h-5" />, label: 'Infographic' },
    { mode: 'video',       icon: <Video className="w-5 h-5" />,          label: 'Video'       },
    { mode: 'chat',        icon: <MessageSquare className="w-5 h-5" />,  label: 'AI Chat'     },
  ];

  return (
    <div className={`flex flex-col h-screen w-full font-sans ${base}`}>
      {/* ── Header ── */}
      <header className={`flex items-center justify-between px-4 py-3 border-b ${border} flex-shrink-0`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/user')}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${ctrlBtn}`}
            aria-label="Exit manual"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img
            src={logo}
            alt="ClearGuide"
            className={`h-7 w-auto ${hc ? 'brightness-0 invert' : ''}`}
          />
          {viewMode !== 'welcome' && (
            <span className={`text-xs hidden sm:block truncate max-w-[160px] ${hc ? 'text-yellow-500' : 'text-slate-400'}`}>
              / {manual.productName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5" role="group" aria-label="Accessibility Controls">
          {/* TTS toggle — only relevant in text mode */}
          {viewMode === 'text' && (
            <button
              onClick={() => setTtsEnabled(p => !p)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${ttsEnabled ? (hc ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-emerald-500 text-white border-emerald-500') : ctrlBtn}`}
              aria-label="Toggle text-to-speech"
              aria-pressed={ttsEnabled}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}
          <button onClick={() => setFontSize(p => Math.max(p - 2, 12))} className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${ctrlBtn}`} aria-label="Decrease font size">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={() => setFontSize(p => Math.min(p + 2, 32))} className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${ctrlBtn}`} aria-label="Increase font size">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setHighContrast(p => !p)}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${hc ? 'bg-yellow-400 text-black border-yellow-400' : ctrlBtn}`}
            aria-label="Toggle high contrast"
            aria-pressed={hc}
          >
            <Contrast className="w-4 h-4" />
          </button>
          {/* Download always visible in header */}
          {viewMode !== 'welcome' && <DownloadButton manual={manual} hc={hc} />}
          {/* Language picker — always visible */}
          <LanguagePicker value={language} onChange={setLanguage} hc={hc} compact />
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Welcome screen — full width, no sidebar */}
        {viewMode === 'welcome' && (
          <div className="flex-1 overflow-y-auto">
            <WelcomeScreen manual={manual} onSelect={setViewMode} hc={hc} language={language} onLanguageChange={setLanguage} />
          </div>
        )}

        {/* Sidebar — only when not on welcome, video, or infographic */}
        {viewMode !== 'welcome' && viewMode !== 'video' && viewMode !== 'infographic' && (
          <nav
            className={`hidden md:block w-56 overflow-y-auto border-r ${border} p-4 flex-shrink-0`}
            aria-label="Manual Sections"
          >
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${hc ? 'text-yellow-500' : 'text-slate-400'}`}>
              Sections
            </p>
            <ul className="space-y-1">
              {manual.sections.map((section, idx) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(idx)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${activeSection === idx ? navActive : navHover}`}
                    style={{ fontSize: `${fontSize - 2}px` }}
                    aria-current={activeSection === idx ? 'step' : undefined}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Content area */}
        {viewMode !== 'welcome' && (
          <div className={`flex-1 overflow-y-auto ${viewMode === 'infographic' ? 'p-0' : 'p-6 md:p-8'}`}>

            {/* Language banner — shown when non-English is selected */}
            {language !== 'en' && viewMode !== 'infographic' && (
              <div className={`flex items-center gap-2.5 mb-5 px-4 py-2.5 rounded-xl border text-sm ${hc ? 'border-yellow-400 bg-gray-900 text-yellow-300' : 'border-emerald-100 bg-emerald-50 text-emerald-800'}`}>
                <Globe className={`w-4 h-4 flex-shrink-0 ${hc ? 'text-yellow-400' : 'text-emerald-500'}`} />
                <span>
                  Showing AI-translated content in{' '}
                  <strong>{LANGUAGES.find(l => l.code === language)?.flag} {LANGUAGES.find(l => l.code === language)?.label}</strong>.
                </span>
                <button
                  onClick={() => setLanguage('en')}
                  className={`ml-auto text-xs underline flex-shrink-0 ${hc ? 'text-yellow-400' : 'text-emerald-600'}`}
                >
                  Switch to English
                </button>
              </div>
            )}
            {/* ── Text with Images ── */}
            {viewMode === 'text' && currentSection && (
              <article aria-labelledby="section-title">
                <h2 id="section-title" className="font-bold mb-4" style={{ fontSize: `${fontSize + 8}px` }}>
                  {currentSection.title}
                </h2>
                {/* Section image — fills width, capped at 45vh so text stays visible */}
                {SECTION_IMAGES[activeSection] && (
                  <div className="mb-5 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                    <img
                      src={SECTION_IMAGES[activeSection]}
                      alt={`Illustration for ${currentSection.title}`}
                      className="w-full object-contain max-h-[45vh]"
                    />
                  </div>
                )}
                <div
                  className={`whitespace-pre-wrap leading-relaxed ${hc ? 'text-yellow-300' : 'text-slate-700'}`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {currentSection.content}
                </div>
              </article>
            )}

            {/* ── Infographic ── fills the full remaining screen height ── */}
            {viewMode === 'infographic' && (
              <div className="flex flex-col h-full">
                {/* Slim title bar */}
                <div className={`flex items-center justify-between px-6 py-3 border-b flex-shrink-0 ${hc ? 'border-yellow-400' : 'border-slate-100'}`}>
                  <div>
                    <h2 className={`font-bold text-base ${hc ? 'text-yellow-400' : 'text-slate-900'}`}>
                      {manual.productName}
                    </h2>
                    <p className={`text-xs ${hc ? 'text-yellow-600' : 'text-slate-400'}`}>Visual product overview</p>
                  </div>
                </div>
                {/* Image fills all remaining height, no scroll */}
                <div className="flex-1 overflow-hidden flex items-center justify-center bg-slate-50 p-4">
                  <img
                    src={infographic}
                    alt={`Infographic for ${manual.productName}`}
                    className="max-w-full max-h-full object-contain rounded-2xl"
                  />
                </div>
              </div>
            )}

            {/* ── Video ── */}
            {viewMode === 'video' && (
              <div className="flex flex-col lg:flex-row gap-5 h-full">

                {/* ── Left: main player ── */}
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                  <h2 className="font-bold" style={{ fontSize: `${fontSize + 6}px` }}>
                    {currentSection.title}
                  </h2>
                  <div className={`aspect-video rounded-2xl overflow-hidden ${hc ? 'bg-gray-900' : 'bg-slate-900'}`}>
                    <video
                      key={currentSection.id}
                      controls
                      autoPlay
                      className="w-full h-full"
                      aria-label={`Video for ${currentSection.title}`}
                    >
                      <source src={SECTION_VIDEOS[activeSection] ?? productVideo} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  {/* Audio description */}
                  <div className={`px-4 py-3 rounded-xl border flex items-start gap-2 ${hc ? 'border-yellow-400 bg-gray-900' : 'border-emerald-100 bg-emerald-50'}`}>
                    <Volume2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${hc ? 'text-yellow-400' : 'text-emerald-600'}`} />
                    <p className={`text-xs leading-relaxed ${hc ? 'text-yellow-300' : 'text-emerald-800'}`}>
                      {currentSection.audioDescription}
                    </p>
                  </div>
                </div>

                {/* ── Right: section thumbnails ── */}
                <div className="lg:w-56 xl:w-64 flex-shrink-0 flex flex-col gap-3">
                  <p className={`text-xs font-semibold uppercase tracking-wider ${hc ? 'text-yellow-500' : 'text-slate-400'}`}>
                    All Sections
                  </p>
                  {/* On mobile: horizontal scroll row; on lg: vertical stack */}
                  <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
                    {manual.sections.map((section, idx) => {
                      const isActive = idx === activeSection;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(idx)}
                          className={`group flex-shrink-0 w-40 lg:w-full text-left rounded-xl overflow-hidden border-2 transition-all ${
                            isActive
                              ? hc ? 'border-yellow-400' : 'border-emerald-500 shadow-md'
                              : hc ? 'border-gray-700 hover:border-yellow-400' : 'border-slate-100 hover:border-emerald-300'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className={`relative aspect-video ${hc ? 'bg-gray-900' : 'bg-slate-800'} overflow-hidden`}>
                            <video
                              className="w-full h-full object-cover opacity-70"
                              muted
                              preload="metadata"
                              aria-hidden="true"
                            >
                              <source src={`${SECTION_VIDEOS[idx] ?? productVideo}#t=1`} type="video/mp4" />
                            </video>
                            <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isActive ? (hc ? 'bg-yellow-400' : 'bg-emerald-500') : 'bg-white/80'}`}>
                                <Play className={`w-3 h-3 ml-0.5 ${isActive ? 'text-white' : 'text-slate-800'}`} />
                              </div>
                            </div>
                            {isActive && (
                              <div className={`absolute top-1 right-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${hc ? 'bg-yellow-400 text-black' : 'bg-emerald-500 text-white'}`}>
                                ▶
                              </div>
                            )}
                          </div>
                          {/* Title */}
                          <div className={`px-2.5 py-2 ${hc ? 'bg-gray-900' : 'bg-white'}`}>
                            <p className={`text-xs font-semibold leading-tight line-clamp-2 ${
                              isActive
                                ? hc ? 'text-yellow-400' : 'text-emerald-600'
                                : hc ? 'text-yellow-300' : 'text-slate-700'
                            }`}>
                              {section.title}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* ── AI Chat (text + voice merged) ── */}
            {viewMode === 'chat' && (
              <div className="h-full min-h-[400px]">
                <AIChatSupport manualId={manual.id} highContrast={hc} audioEnabled />
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Bottom Navigation ── */}
      {viewMode !== 'welcome' && (
        <nav
          className={`flex border-t ${border} ${hc ? 'bg-black' : 'bg-white'} flex-shrink-0`}
          aria-label="View Modes"
        >
          {navModes.map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${viewMode === mode ? bottomActive : bottomInactive}`}
              aria-pressed={viewMode === mode}
            >
              {icon}
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
          {/* Download in bottom nav */}
          <div className="flex-1 flex flex-col items-center justify-center py-3 relative">
            <DownloadButton manual={manual} hc={hc} />
          </div>
        </nav>
      )}
    </div>
  );
}
