'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, Zap, Eye, MessageSquare, Smartphone, LayoutDashboard, ChevronDown, Star, Check, ArrowRight, FileText, Globe, Headphones, X } from 'lucide-react';

function GreenButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm ${className}`}
    >
      {children}
    </button>
  );
}

function OutlineButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`border border-slate-300 hover:border-emerald-500 hover:text-emerald-600 text-slate-700 font-semibold px-6 py-3 rounded-full transition-colors text-sm bg-white ${className}`}
    >
      {children}
    </button>
  );
}

function Nav({ onLogin, onGetStarted }: { onLogin: () => void; onGetStarted: () => void }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold text-emerald-600">ClearGuide</div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-600 font-medium">
          <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a>
          <a href="#about" className="hover:text-emerald-600 transition-colors">About</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onLogin} className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors">Login</button>
          <GreenButton onClick={onGetStarted}>Get Started</GreenButton>
        </div>
      </div>
    </nav>
  );
}

function Hero({ onGetStarted, onLearnMore }: { onGetStarted: () => void; onLearnMore: () => void }) {
  return (
    <section className="p-10 text-center bg-white grid lg:grid-cols-2">
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-6 border border-emerald-100">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered Manual Platform
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-5">
          Your Manuals, <span className="text-emerald-500">Simplified</span>
        </h1>
        <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto leading-relaxed">
          Replace paper manuals with accessible, AI-powered digital guides. Designed for everyone — high contrast, audio support, and instant AI chat.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <GreenButton onClick={onGetStarted} className="px-8 py-3.5 text-base">
            Get Started Free
          </GreenButton>
          <OutlineButton onClick={onLearnMore} className="px-8 py-3.5 text-base">
            Learn More
          </OutlineButton>
        </div>
      </div>
      <div className="justify-items-center m-2">
        <div className="w-3/4 h-64 bg-gradient-to-br from-slate-200 to-emerald-100 rounded-2xl"></div>
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { value: '10K+', label: 'Manuals Published' },
    { value: '98%', label: 'Accessibility Score' },
    { value: '5K+', label: 'Active Users' },
    { value: '300+', label: 'Manufacturers' },
  ];
  return (
    <section className="bg-gray-800 py-10">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-emerald-100 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <Nav
        onLogin={() => router.push('/manufacturer/login')}
        onGetStarted={() => router.push('/manufacturer/login')}
      />
      <Hero
        onGetStarted={() => router.push('/manufacturer/login')}
        onLearnMore={() => {}}
      />
      <StatsBar />
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900">Features</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Eye, title: 'Accessible Viewer', desc: 'High-contrast mode and adjustable font sizes' },
              { icon: MessageSquare, title: 'AI Chat Support', desc: 'Get instant answers from the manual' },
              { icon: LayoutDashboard, title: 'Dashboard', desc: 'Manage and track your manuals' },
              { icon: Smartphone, title: 'QR Integration', desc: 'Scan and access directly' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 flex gap-5 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900">{f.title}</span>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
