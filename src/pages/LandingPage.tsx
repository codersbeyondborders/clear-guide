import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ShieldCheck, Zap, Eye, MessageSquare,
  Smartphone, LayoutDashboard, ChevronDown, ChevronUp,
  Star, Check, ArrowRight, FileText, Globe, Headphones, X
} from 'lucide-react';
import logo from '../assets/logo.png';
import beforeImg from '../assets/before.webp';
import afterImg from '../assets/after.webp';
import heroImg from '../assets/hero.webp';



// ─── Reusable primitives ────────────────────────────────────────────────────

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

// ─── Nav ────────────────────────────────────────────────────────────────────

function Nav({ onLogin, onGetStarted }: { onLogin: () => void; onGetStarted: () => void }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <img src={logo} alt="ClearGuide" className="h-20 w-auto" />
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

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero({ onGetStarted, onLearnMore }: { onGetStarted: () => void; onLearnMore: () => void }) {
  return (
    <section className="p-10 text-center bg-white grid lg:grid-cols-2">
      <div className="">
        <div className="mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-6 border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Manual Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-5">
            Your Manuals,{' '}
            <span className="text-emerald-500">Simplified</span>
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



      </div>
      <div className="justify-items-center m-2">
        <img
          src={heroImg}
          alt="Hero Image"
          className="w-3/4  object-fit"
        />
      </div>



      {/* Hero mockup */}
      {/* <div className="mt-14 max-w-4xl mx-auto relative">
        <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-3xl border border-slate-200 shadow-xl p-6 md:p-10">
          <div className="grid md:grid-cols-3 gap-4">
         
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="h-2.5 w-28 bg-slate-200 rounded-full mb-1.5"></div>
                  <div className="h-2 w-20 bg-slate-100 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2.5">
                {[80, 60, 90, 50].map((w, i) => (
                  <div key={i} className="h-2.5 bg-slate-100 rounded-full" style={{ width: `${w}%` }}></div>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <div className="h-8 w-24 bg-emerald-500 rounded-full"></div>
                <div className="h-8 w-20 bg-slate-100 rounded-full"></div>
              </div>
            </div>
           
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <div className="h-2 w-16 bg-slate-200 rounded-full mb-1.5"></div>
                  <div className="h-2 w-12 bg-slate-100 rounded-full"></div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <div className="h-2 w-20 bg-slate-200 rounded-full mb-1.5"></div>
                  <div className="h-2 w-14 bg-slate-100 rounded-full"></div>
                </div>
              </div>
              <div className="bg-emerald-500 rounded-2xl p-4 text-white">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-xs text-emerald-100 mt-1">User satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

    </section>
  );
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────

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

// ─── Why Choose ──────────────────────────────────────────────────────────────

function WhyChoose() {
  const items = [
    { icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, title: 'WCAG 2.2 AAA', desc: 'The only platform focused on fully accessible digital manuals.' },
    { icon: <Zap className="w-5 h-5 text-emerald-500" />, title: 'Instant AI Answers', desc: 'Contextual AI chat trained on each product manual.' },
    { icon: <Globe className="w-5 h-5 text-emerald-500" />, title: 'Multi-language Support', desc: 'Serve global audiences with automatic translation.' },
    { icon: <Headphones className="w-5 h-5 text-emerald-500" />, title: 'Audio Descriptions', desc: 'Every diagram and image narrated for screen reader users.' },
  ];
  return (
    <section className="py-20 bg-white" id="about">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-emerald-600 font-semibold text-sm mb-3">Why ClearGuide?</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-4">
              The Smarter Choice<br />for Accessible Manuals
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Traditional paper manuals exclude millions of users. ClearGuide transforms them into living, accessible digital experiences that work for everyone.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {items.map((item) => (
              <div key={item.title} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <div className="font-semibold text-slate-900 text-sm mb-1">{item.title}</div>
                <div className="text-slate-500 text-xs leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features ────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    {
      icon: <Eye className="w-6 h-6 text-emerald-500" />,
      title: 'Accessible Manual Viewer',
      desc: 'High-contrast mode, adjustable font sizes, and keyboard navigation built in from day one.',
      tag: 'Accessibility',
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
      title: 'AI Chat Support',
      desc: 'Users ask questions in plain language and get instant, accurate answers from the manual.',
      tag: 'AI-Powered',
    },
    {
      icon: <LayoutDashboard className="w-6 h-6 text-emerald-500" />,
      title: 'Manufacturer Dashboard',
      desc: 'Upload, edit, and publish manuals. Track engagement analytics in real time.',
      tag: 'Analytics',
    },
    {
      icon: <Smartphone className="w-6 h-6 text-emerald-500" />,
      title: 'Smart QR Integration',
      desc: 'Print a QR code on your product. Users scan and land directly on the right manual.',
      tag: 'Integration',
    },
  ];
  return (
    <section className="py-20 bg-slate-50" id="features">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-emerald-600 font-semibold text-sm mb-3">Platform Features</p>
          <h2 className="text-4xl font-bold text-slate-900">Tools to Elevate Your Manuals</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 flex gap-5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-slate-900">{f.title}</span>
                  <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">{f.tag}</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Before & After ──────────────────────────────────────────────────────────

function BeforeAfter() {
  const rows = [
    {
      pain: 'Squinting at tiny printed text in poor lighting',
      gain: 'Adjustable font sizes and high-contrast mode built in',
    },
    {
      pain: 'Manual lost or thrown away with the packaging',
      gain: 'Always accessible via QR code or product search',
    },
    {
      pain: 'No help when a step is confusing or unclear',
      gain: 'Instant AI chat answers any question in plain language',
    },
    {
      pain: 'Diagrams with no explanation for visually impaired users',
      gain: 'Audio descriptions and text-to-speech for every section',
    },
    {
      pain: 'Manual only available in one language',
      gain: 'Auto-translated into 16 languages at the tap of a button',
    },
    {
      pain: 'Calling support for basic setup questions',
      gain: 'Voice-activated AI chat answers hands-free, 24/7',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-emerald-600 font-semibold text-sm mb-3">The Difference</p>
          <h2 className="text-4xl font-bold text-slate-900">Before & After ClearGuide</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto text-base">
            See how the experience changes when manuals are built for people, not paper.
          </p>
        </div>

        {/* Image comparison */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {/* Before image */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-red-200 shadow-sm">
            <img
              src={beforeImg}
              alt="Before ClearGuide — confusing paper manual"
              className="w-full h-56 object-cover"
            />
            <div className="absolute inset-0 bg-red-900/20" />
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-red-900/80 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <X className="w-3 h-3 text-white" />
                </div>
                <span className="text-white text-sm font-semibold">Without ClearGuide</span>
              </div>
              <p className="text-red-200 text-xs mt-1">Confusing, inaccessible, easy to lose</p>
            </div>
          </div>
          {/* After image */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-sm">
            <img
              src={afterImg}
              alt="After ClearGuide — clear accessible digital manual"
              className="w-full h-56 object-cover"
            />
            <div className="absolute inset-0 bg-emerald-900/10" />
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-emerald-900/70 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white text-sm font-semibold">With ClearGuide</span>
              </div>
              <p className="text-emerald-100 text-xs mt-1">Clear, accessible, always available</p>
            </div>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-2 gap-4 mb-4 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <X className="w-3.5 h-3.5 text-red-500" />
            </div>
            <span className="font-semibold text-slate-700 text-sm">Without ClearGuide</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="font-semibold text-slate-700 text-sm">With ClearGuide</span>
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              {/* Before */}
              <div className="flex items-start gap-3 border border-red-100 rounded-2xl px-5 py-4">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-red-500" />
                </div>
                <p className="text-sm leading-relaxed">{row.pain}</p>
              </div>
              {/* After */}
              <div className="flex items-start gap-3 border border-emerald-100 rounded-2xl px-5 py-4">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <p className="text-sm  leading-relaxed">{row.gain}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Seamless Integration ────────────────────────────────────────────────────

function SeamlessSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-emerald-600 font-semibold text-sm mb-3">For Manufacturers</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-5">
              Seamless Integration with Your Workflow
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Upload your existing PDF manuals or create new ones from scratch. ClearGuide automatically structures content, adds accessibility metadata, and generates AI training data — all in minutes.
            </p>
            <ul className="space-y-3 mb-8">
              {['PDF & Word import', 'Auto-generated QR codes', 'Real-time analytics', 'Multi-product management'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-700 text-sm">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <GreenButton onClick={onGetStarted}>
              Start for Free <ArrowRight className="w-4 h-4 inline ml-1" />
            </GreenButton>
          </div>
          {/* Mock dashboard */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="h-3 w-24 bg-slate-200 rounded-full"></div>
                <div className="h-6 w-16 bg-emerald-100 rounded-full"></div>
              </div>
              <div className="flex items-end gap-2 h-24">
                {[50, 75, 40, 90, 60, 85, 70].map((h, i) => (
                  <div key={i} className="flex-1 bg-emerald-500 rounded-t-md opacity-80" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-slate-100 p-4">
                <div className="text-2xl font-bold text-slate-900">7 days</div>
                <div className="text-xs text-slate-400 mt-1">Avg. setup time</div>
              </div>
              <div className="bg-emerald-500 rounded-xl p-4 text-white">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-xs text-emerald-100 mt-1">AI support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ────────────────────────────────────────────────────────────

function Testimonials() {
  const reviews = [
    { name: 'Sarah M.', role: 'Product Manager', text: 'ClearGuide cut our support tickets by 40%. Users actually understand our product now.', stars: 5 },
    { name: 'James T.', role: 'Accessibility Lead', text: 'Finally a manual platform that takes WCAG seriously. The high-contrast mode is flawless.', stars: 5 },
    { name: 'Priya K.', role: 'End User', text: 'I have low vision and this is the first manual I could actually read without help. Amazing.', stars: 5 },
  ];
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-emerald-600 font-semibold text-sm mb-3">Testimonials</p>
          <h2 className="text-4xl font-bold text-slate-900">Real Results from Real Users</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-5">"{r.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {r.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{r.name}</div>
                  <div className="text-slate-400 text-xs">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

function Pricing({ onGetStarted }: { onGetStarted: () => void }) {
  const plans = [
    {
      name: 'Free',
      price: '£0',
      period: '/mo',
      desc: 'Perfect for trying out ClearGuide',
      features: ['Up to 3 manuals', 'Basic accessibility features', 'QR code generation', 'Community support'],
      cta: 'Get Started',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '£29',
      period: '/mo',
      desc: 'For growing manufacturers',
      features: ['Unlimited manuals', 'Full accessibility suite', 'AI chat support', 'Analytics dashboard', 'Priority support'],
      cta: 'Start Free Trial',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: '£89',
      period: '/mo',
      desc: 'For large-scale operations',
      features: ['Everything in Pro', 'Custom branding', 'SSO & team management', 'API access', 'Dedicated account manager'],
      cta: 'Contact Sales',
      highlight: false,
    },
  ];
  return (
    <section className="py-20 bg-white" id="pricing">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-emerald-600 font-semibold text-sm mb-3">Pricing</p>
          <h2 className="text-4xl font-bold text-slate-900">Plans That Fit Your Journey</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${plan.highlight ? 'bg-gray-800 border-emerald-500 border-4 text-white shadow-xl scale-105' : 'bg-white border-slate-200 shadow-sm hover:border-emerald-500 hover:border-4 hover:scale-105'}`}
            >
              <div className={`text-sm font-semibold mb-1 ${plan.highlight ? 'text-emerald-100' : 'text-slate-500'}`}>{plan.name}</div>
              <div className="flex items-end gap-1 mb-2">
                <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                <span className={`text-sm mb-1 ${plan.highlight ? 'text-emerald-100' : 'text-slate-400'}`}>{plan.period}</span>
              </div>
              <p className={`text-sm mb-6 ${plan.highlight ? 'text-emerald-100' : 'text-slate-500'}`}>{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2.5 text-sm ${plan.highlight ? 'text-white' : 'text-slate-700'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-white/20' : 'bg-emerald-100'}`}>
                      <Check className={`w-2.5 h-2.5 ${plan.highlight ? 'text-white' : 'text-emerald-600'}`} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className={`w-full py-3 rounded-full font-semibold text-sm transition-colors ${plan.highlight
                  ? 'bg-white text-emerald-600 hover:bg-emerald-50'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    { q: 'How do I get started with ClearGuide?', a: 'Sign up for a free account, upload your first manual (PDF or Word), and ClearGuide will automatically process and publish it within minutes.' },
    { q: 'Does the platform support multiple languages?', a: 'Yes. ClearGuide supports automatic translation into 30+ languages, making your manuals accessible to a global audience.' },
    { q: 'Can I customize the look of my manuals?', a: 'Pro and Enterprise plans allow full custom branding including logo, colors, and domain.' },
    { q: 'Is the AI chat available on all plans?', a: 'AI chat support is available on Pro and Enterprise plans. Free users get a limited preview.' },
    { q: 'How secure is my manual data?', a: 'All data is encrypted at rest and in transit. We are SOC 2 Type II compliant and never share your data with third parties.' },
  ];
  return (
    <section className="py-20 bg-slate-50" id="faq">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <p className="text-emerald-600 font-semibold text-sm mb-3">FAQ</p>
            <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-4">Frequently Asked Questions</h2>
            <GreenButton>Contact Us</GreenButton>
          </div>
          <div className="md:col-span-2 space-y-3">
            {items.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-slate-900 font-medium text-sm hover:bg-slate-50 transition-colors"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  {item.q}
                  {open === i ? <ChevronUp className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </button>
                {open === i && (
                  <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-50">
                    <div className="pt-3">{item.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Footer ──────────────────────────────────────────────────────────────

function CTASection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-medium text-slate-900 mb-4">
          User Manuals that are actually <strong className="font-bold">User-friendly</strong>
        </h2>
        <p className="text-slate-500 mb-8">Join thousands of manufacturers delivering better experiences to their users.</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <GreenButton onClick={onGetStarted} className="px-8 py-3.5 text-base">
            Get Started Free
          </GreenButton>
          <OutlineButton className="px-8 py-3.5 text-base">
            Book a Demo
          </OutlineButton>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div>
            <img src={logo} alt="ClearGuide" className="h-7 w-auto brightness-0 invert" />
            <p className="text-sm leading-relaxed">Making product manuals accessible for everyone.</p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Changelog'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers'] },
            { title: 'Support', links: ['Docs', 'Contact', 'Status'] },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-white font-semibold text-sm mb-3">{col.title}</div>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm hover:text-emerald-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-6 text-xs text-center">
          © {new Date().getFullYear()} ClearGuide. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function LandingPage() {
  const navigate = useNavigate();
  const goManufacturer = () => navigate('/manufacturer/login');
  const goUser = () => navigate('/user');

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Nav onLogin={goManufacturer} onGetStarted={goUser} />
      <Hero onGetStarted={goUser} onLearnMore={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} />
      <StatsBar />
      <WhyChoose />
      <Features />
      <BeforeAfter />
      <SeamlessSection onGetStarted={goManufacturer} />
      <Testimonials />
      <Pricing onGetStarted={goUser} />
      <FAQ />
      <CTASection onGetStarted={goUser} />
      <Footer />
    </div>
  );
}
