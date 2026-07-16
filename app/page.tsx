import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen, ChevronRight, Check, X, Star,
  Shield, MessageSquare, Globe, Volume2,
  LayoutDashboard, QrCode, ChevronDown, Zap,
  ArrowRight, Users, TrendingUp, Award, Sparkles,
} from 'lucide-react'
import { FindYourGuideSection } from '@/components/FindYourGuideSection'
import { NavBar } from '@/components/NavBar'

/* ─── Hero ─────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      className="overflow-hidden bg-white"
      aria-labelledby="hero-heading"
    >
      <div className="container">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center py-16 md:py-24">
          {/* Left — text */}
          <div className="order-2 md:order-1 max-w-lg">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-7 border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              AI-Powered Manual Platform
            </div>

            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-slate-900 tracking-tight leading-[1.08] mb-5 text-balance"
            >
              Product Manuals{' '}
              <span className="block" style={{ color: 'var(--color-primary)' }}>
                Built for People
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-500 leading-relaxed mb-9 max-w-[440px]">
              Replace confusing paper manuals with accessible, AI-powered digital guides.
              High-contrast, multilingual, and instant AI chat — built for everyone.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Link href="/sign-up" className="btn-primary text-sm">
                Get Started Free
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a href="#features" className="btn-outline text-sm">
                See Features
              </a>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {[
                'No credit card required',
                'WCAG 2.2 AAA',
                'Free plan available',
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <span className="w-1 h-1 rounded-full bg-slate-300" aria-hidden="true" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — hero image */}
          <div className="order-1 md:order-2 rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-100">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero-8tPcFkA81Hr8dcec9WRNOhBbBVqiW9.webp"
              alt="Split illustration: frustrated user struggling with paper manual on the left, happy user accessing digital guide on phone on the right"
              width={640}
              height={480}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Logos / Social proof strip ────────────────────────────────────────── */
function TrustBar() {
  const brands = [
    'Bosch', 'Philips', 'Dyson', 'Samsung', 'Miele', 'Siemens',
  ]
  return (
    <section
      className="border-y border-slate-100 bg-slate-50 py-6"
      aria-label="Trusted by leading manufacturers"
    >
      <div className="container">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-5">
          Trusted by leading manufacturers
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {brands.map((b) => (
            <span key={b} className="text-sm font-bold text-slate-300 tracking-tight">{b}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Stats Bar ─────────────────────────────────────────────────────────── */
const stats = [
  { value: '10K+', label: 'Manuals Published',  icon: BookOpen    },
  { value: '98%',  label: 'Accessibility Score', icon: Award       },
  { value: '5K+',  label: 'Active Users',        icon: Users       },
  { value: '300+', label: 'Manufacturers',        icon: TrendingUp  },
]

function Stats() {
  return (
    <section
      className="bg-slate-900 py-12"
      aria-label="Platform statistics"
    >
      <div className="container">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden">
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center bg-slate-900"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-1"
                style={{ backgroundColor: 'rgba(0,196,122,0.15)' }}
                aria-hidden="true"
              >
                <Icon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              </div>
              <dt className="text-3xl font-bold tabular-nums tracking-tight text-white">{value}</dt>
              <dd className="text-xs text-slate-400 font-medium">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ─── Why ClearGuide ────────────────────────────────────────────────────── */
const whyFeatures = [
  {
    icon: Shield,
    title: 'WCAG 2.2 AAA Compliant',
    description: 'Every guide passes the highest accessibility standard. High contrast, keyboard navigation, and screen reader support built in.',
  },
  {
    icon: MessageSquare,
    title: 'Instant AI Answers',
    description: 'Contextual AI chat answers any question from within the manual, in the user\'s own language, instantly.',
  },
  {
    icon: Globe,
    title: '50+ Languages',
    description: 'AI-powered translations auto-generated at publish time. One upload, every language.',
  },
  {
    icon: Volume2,
    title: 'Audio Descriptions',
    description: 'Full text-to-speech narration and image descriptions for visually impaired users.',
  },
]

function WhyClearGuide() {
  return (
    <section
      className="py-20 md:py-28 bg-white"
      aria-labelledby="why-heading"
    >
      <div className="container">
        <div className="grid md:grid-cols-2 gap-14 items-start">
          {/* Left */}
          <div className="md:sticky md:top-28">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: 'var(--color-primary)' }}
            >
              Why ClearGuide?
            </p>
            <h2
              id="why-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-5 tracking-tight"
            >
              The Smarter Choice for{' '}
              <em className="not-italic" style={{ color: 'var(--color-primary)' }}>
                Accessible
              </em>{' '}
              Manuals
            </h2>
            <p className="text-slate-500 leading-relaxed text-base max-w-sm">
              Traditional paper manuals exclude millions of users. ClearGuide turns
              them into living, accessible digital experiences that work for everyone.
            </p>
          </div>

          {/* Right — 2×2 feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyFeatures.map((f) => (
              <article
                key={f.title}
                className="rounded-2xl border border-slate-100 p-6 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--color-primary-subtle)' }}
                  aria-hidden="true"
                >
                  <f.icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Platform Features ─────────────────────────────────────────────────── */
const platformFeatures = [
  {
    icon: BookOpen,
    badge: 'Accessibility',
    title: 'Accessible Manual Viewer',
    description:
      'High contrast mode, adjustable font sizes, zoom controls, and full keyboard navigation — built in from day one.',
  },
  {
    icon: MessageSquare,
    badge: 'AI-Powered',
    title: 'AI Chat Support',
    description:
      'Ask any question and receive instant, accurate answers drawn directly from the manual content.',
  },
  {
    icon: LayoutDashboard,
    badge: 'Analytics',
    title: 'Manufacturer Dashboard',
    description:
      'Upload, edit, and publish manuals. Track engagement, drop-off points, and search queries in real time.',
  },
  {
    icon: QrCode,
    badge: 'Integration',
    title: 'Smart QR Integration',
    description:
      'Auto-generated QR codes link directly to the correct manual. Print on packaging and users are guided instantly.',
  },
]

function PlatformFeatures() {
  return (
    <section
      id="features"
      className="py-20 md:py-28 bg-slate-50"
      aria-labelledby="platform-heading"
    >
      <div className="container">
        <header className="mb-14">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            Platform Features
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2
              id="platform-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight max-w-xl"
            >
              Every Tool to Elevate Your Manuals
            </h2>
            <Link href="/sign-up" className="btn-primary text-sm shrink-0 self-start md:self-auto">
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <div className="grid sm:grid-cols-2 gap-5">
          {platformFeatures.map((f, i) => (
            <article
              key={f.title}
              className={`rounded-2xl p-7 border flex items-start gap-5 transition-shadow hover:shadow-md ${
                i === 0
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-white border-slate-100'
              }`}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: i === 0 ? 'rgba(0,196,122,0.15)' : 'var(--color-primary-subtle)',
                }}
                aria-hidden="true"
              >
                <f.icon
                  className="w-5 h-5"
                  style={{ color: 'var(--color-primary)' }}
                />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: i === 0 ? 'rgba(0,196,122,0.15)' : 'var(--color-primary-subtle)',
                      color: i === 0 ? '#4ade80' : 'var(--color-emerald-700)',
                    }}
                  >
                    {f.badge}
                  </span>
                </div>
                <h3
                  className="text-base font-bold mb-2 tracking-tight"
                  style={{ color: i === 0 ? '#ffffff' : '#0f172a' }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: i === 0 ? 'rgba(255,255,255,0.6)' : '#64748b' }}
                >
                  {f.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Before & After ────────────────────────────────────────────────────── */
const withoutList = [
  'Squinting at tiny printed text in poor lighting',
  'Manual lost or discarded with the packaging',
  'No help when a step is confusing or unclear',
  'Diagrams with no explanation for visually impaired users',
  'Only available in one language',
  'Calling support for basic setup questions',
]

const withList = [
  'Adjustable font sizes and high contrast mode built in',
  'Always accessible via QR code or product search',
  'Instant AI chat answers any question in plain language',
  'Audio descriptions and text-to-speech for every section',
  'Auto-translated into 50+ languages at the tap of a button',
  'Voice-activated AI answers hands-free, 24/7',
]

function BeforeAfter() {
  return (
    <section
      className="py-20 md:py-28 bg-white"
      aria-labelledby="ba-heading"
    >
      <div className="container">
        <header className="mb-14">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            The Difference
          </p>
          <h2
            id="ba-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4"
          >
            Before &amp; After ClearGuide
          </h2>
          <p className="text-slate-500 text-base max-w-md">
            See how the experience transforms when manuals are built for people, not paper.
          </p>
        </header>

        {/* Photos */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12 max-w-3xl">
          <figure className="relative rounded-2xl overflow-hidden shadow-md">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/before-ftzlTJ2qEGFIpK2fQR4hTJ87Yd62ZC.webp"
              alt="Elderly woman struggling to read a tiny paper manual with a magnifying glass"
              width={600}
              height={400}
              className="w-full object-cover"
              style={{ height: '16rem' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" aria-hidden="true" />
            <div className="absolute bottom-4 left-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white text-red-600 shadow-sm">
                <X className="w-3 h-3" aria-hidden="true" />
                Without ClearGuide
              </span>
            </div>
          </figure>

          <figure className="relative rounded-2xl overflow-hidden shadow-md">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/after-Fxe8lwx6J74SmS3LZvmRS5ye0R8CqI.webp"
              alt="Same woman now smiling, holding a phone showing the ClearGuide digital manual for the coffee maker"
              width={600}
              height={400}
              className="w-full object-cover"
              style={{ height: '16rem' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" aria-hidden="true" />
            <div className="absolute bottom-4 left-4">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm"
                style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff' }}
              >
                <Check className="w-3 h-3" aria-hidden="true" />
                With ClearGuide
              </span>
            </div>
          </figure>
        </div>

        {/* Comparison lists */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
          {/* Without */}
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-3 h-3 text-red-500" aria-hidden="true" />
              </span>
              Without ClearGuide
            </h3>
            <ul className="flex flex-col gap-3" aria-label="Problems without ClearGuide">
              {withoutList.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-500">
                  <X className="w-4 h-4 shrink-0 mt-0.5 text-red-400" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* With */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary-subtle)' }}
              >
                <Check className="w-3 h-3" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              </span>
              With ClearGuide
            </h3>
            <ul className="flex flex-col gap-3" aria-label="Benefits with ClearGuide">
              {withList.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <Check
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: 'var(--color-primary)' }}
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Manufacturer Integration ──────────────────────────────────────────── */
const manufacturerBenefits = [
  { text: 'PDF & Word import — convert existing manuals instantly' },
  { text: 'Auto-generated QR codes for every product' },
  { text: 'Real-time analytics: views, searches, and drop-offs' },
  { text: 'Multi-product management from one dashboard' },
]

function ManufacturerSection() {
  return (
    <section
      className="py-20 md:py-28 bg-slate-900"
      aria-labelledby="mfr-heading"
    >
      <div className="container">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Left */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-5 text-emerald-400">
              For Manufacturers
            </p>
            <h2
              id="mfr-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5 tracking-tight"
            >
              Seamless Integration with Your Workflow
            </h2>
            <p className="text-slate-400 leading-relaxed text-base mb-8 max-w-md">
              Upload your existing PDF manuals or create new ones from scratch.
              ClearGuide automatically structures content, adds accessibility features,
              and generates AI training data — all in minutes.
            </p>

            <ul className="flex flex-col gap-4 mb-10" aria-label="Manufacturer benefits">
              {manufacturerBenefits.map(({ text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-slate-300">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: 'rgba(0,196,122,0.2)' }}
                    aria-hidden="true"
                  >
                    <Check className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  {text}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link href="/sign-up" className="btn-primary text-sm">
                Start for Free
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link href="/manufacturer/login" className="btn-outline text-sm border-slate-600 text-slate-300 hover:border-slate-400">
                View Demo
              </Link>
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
            {/* Mockup header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-bold text-white">Analytics Overview</p>
                <p className="text-xs text-slate-500 mt-0.5">Last 7 days</p>
              </div>
              <span
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(0,196,122,0.15)', color: '#4ade80' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                Live
              </span>
            </div>

            {/* Bar chart */}
            <div
              className="flex items-end gap-2 mb-6"
              style={{ height: '8rem' }}
              role="img"
              aria-label="Bar chart showing increasing manual views over 7 days"
            >
              {[30, 48, 38, 62, 52, 88, 72].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-lg transition-opacity"
                  style={{
                    height: `${h}%`,
                    backgroundColor: i === 5 ? 'var(--color-primary)' : 'rgba(0,196,122,0.25)',
                  }}
                />
              ))}
            </div>

            {/* KPI tiles */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-700/50 p-3 text-center">
                <p className="text-lg font-bold text-white">2.4k</p>
                <p className="text-xs text-slate-400 mt-0.5">Views</p>
              </div>
              <div
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: 'rgba(0,196,122,0.2)' }}
              >
                <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>24/7</p>
                <p className="text-xs text-emerald-400 mt-0.5">AI Support</p>
              </div>
              <div className="rounded-xl bg-slate-700/50 p-3 text-center">
                <p className="text-lg font-bold text-white">98%</p>
                <p className="text-xs text-slate-400 mt-0.5">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonials ──────────────────────────────────────────────────────── */
const testimonials = [
  {
    quote: 'ClearGuide cut our support tickets by 40%. Users actually understand their product now.',
    name: 'Sarah M.',
    role: 'Head of Manufacturing',
    rating: 5,
    company: 'HomeApply Ltd',
  },
  {
    quote: 'The only manual platform that takes WCAG seriously. The high-contrast mode is flawless.',
    name: 'James T.',
    role: 'Accessibility Lead',
    rating: 5,
    company: 'CiAB',
  },
  {
    quote: 'I have low vision and this is the first manual I could actually read without help. Amazing.',
    name: 'Priya K.',
    role: 'End User',
    rating: 5,
    company: '',
  },
]

function Testimonials() {
  return (
    <section
      className="py-20 md:py-28 bg-slate-50"
      aria-labelledby="testimonials-heading"
    >
      <div className="container">
        <header className="mb-14">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            Testimonials
          </p>
          <h2
            id="testimonials-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight"
          >
            Real Results from Real Users
          </h2>
        </header>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <article
              key={t.name}
              className={`rounded-2xl p-7 flex flex-col gap-5 border transition-shadow hover:shadow-md ${
                i === 1
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-100'
              }`}
            >
              <div
                className="flex items-center gap-0.5"
                aria-label={`${t.rating} out of 5 stars`}
              >
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-4 h-4"
                    style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)' }}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <blockquote
                className="text-base leading-relaxed flex-1 font-medium"
                style={{ color: i === 1 ? '#ffffff' : '#1e293b' }}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <footer
                className="flex items-center gap-3 pt-4"
                style={{ borderTop: `1px solid ${i === 1 ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}` }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: i === 1 ? 'rgba(0,196,122,0.2)' : 'var(--color-primary-subtle)',
                    color: 'var(--color-primary)',
                  }}
                  aria-hidden="true"
                >
                  {t.name[0]}
                </div>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: i === 1 ? '#ffffff' : '#0f172a' }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: i === 1 ? 'rgba(255,255,255,0.45)' : '#64748b' }}
                  >
                    {t.role}{t.company ? `, ${t.company}` : ''}
                  </p>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ───────────────────────────────────────────────────────────── */
const plans = [
  {
    name: 'Free',
    price: '£0',
    period: '',
    description: 'Perfect for trying out ClearGuide',
    features: ['Up to 3 manuals', 'Core accessibility features', 'QR code generation', 'Community support'],
    cta: 'Get Started',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '£29',
    period: '/mo',
    description: 'For growing manufacturers',
    features: ['Unlimited manuals', 'Full accessibility suite', 'AI chat support', 'Analytics dashboard', 'Priority support'],
    cta: 'Start Free Trial',
    href: '/sign-up',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '£89',
    period: '/mo',
    description: 'For large-scale operations',
    features: ['Everything in Pro', 'Custom branding & domain', 'SSO & team management', 'Dedicated account manager'],
    cta: 'Contact Sales',
    href: 'mailto:sales@clearguide.io',
    highlight: false,
  },
]

function Pricing() {
  return (
    <section
      id="pricing"
      className="py-20 md:py-28 bg-white"
      aria-labelledby="pricing-heading"
    >
      <div className="container">
        <header className="mb-14">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            Pricing
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2
              id="pricing-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight"
            >
              Plans That Fit Your Journey
            </h2>
            <p className="text-sm text-slate-400 md:text-right max-w-xs">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <article
              key={plan.name}
              aria-label={`${plan.name} plan`}
              className={`rounded-2xl p-8 flex flex-col gap-6 border relative ${
                plan.highlight
                  ? 'bg-slate-900 border-slate-700'
                  : 'bg-white border-slate-100'
              }`}
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff' }}
                >
                  Most Popular
                </div>
              )}

              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: plan.highlight ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className="text-4xl font-bold tabular-nums tracking-tight"
                    style={{ color: plan.highlight ? '#ffffff' : '#0f172a' }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className="text-sm"
                      style={{ color: plan.highlight ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className="text-sm"
                  style={{ color: plan.highlight ? 'rgba(255,255,255,0.45)' : '#64748b' }}
                >
                  {plan.description}
                </p>
              </div>

              <div
                style={{ borderTop: `1px solid ${plan.highlight ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}` }}
              />

              <ul className="flex flex-col gap-3 flex-1" aria-label={`${plan.name} plan features`}>
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm"
                    style={{ color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#334155' }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: plan.highlight ? 'rgba(0,196,122,0.2)' : 'var(--color-primary-subtle)' }}
                      aria-hidden="true"
                    >
                      <Check className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={plan.highlight ? 'btn-primary text-center' : 'btn-outline text-center'}
                style={plan.highlight ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FAQ ───────────────────────────────────────────────────────────────── */
const faqs = [
  {
    q: 'How do I get started with ClearGuide?',
    a: 'Sign up for a free account, upload your first PDF manual, and ClearGuide will automatically convert it into an accessible digital guide within minutes.',
  },
  {
    q: 'Does the platform support multiple languages?',
    a: 'Yes. ClearGuide supports 50+ languages with AI-powered translation. You can publish once and serve every language automatically.',
  },
  {
    q: 'Can I customise the look of my manual?',
    a: 'Pro and Enterprise plans include full custom branding — your logo, colours, and domain.',
  },
  {
    q: 'Is the AI chat available on all plans?',
    a: 'AI chat support is available on the Pro plan and above. Free plan users get full manual access without the chat feature.',
  },
  {
    q: 'How secure is my manual data?',
    a: 'All data is encrypted at rest and in transit. We are SOC 2 Type II compliant and GDPR ready.',
  },
]

function FAQ() {
  return (
    <section
      id="faq"
      className="py-20 md:py-28 bg-slate-50"
      aria-labelledby="faq-heading"
    >
      <div className="container">
        <div className="grid md:grid-cols-[280px_1fr] gap-14 items-start">
          {/* Left */}
          <div className="md:sticky md:top-24">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: 'var(--color-primary)' }}
            >
              FAQ
            </p>
            <h2
              id="faq-heading"
              className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-6 tracking-tight"
            >
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-7">
              Can&apos;t find what you&apos;re looking for? Reach out and we&apos;ll get back to you.
            </p>
            <Link href="/sign-up" className="btn-primary text-sm">
              Contact Us
            </Link>
          </div>

          {/* Accordion */}
          <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white divide-y divide-slate-100">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <details className="group">
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400">
                    <span className="text-sm font-semibold text-slate-900">{faq.q}</span>
                    <ChevronDown
                      className="w-4 h-4 text-slate-400 shrink-0 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Final CTA ─────────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section
      className="py-20 md:py-28 bg-slate-900"
      aria-labelledby="final-cta-heading"
    >
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-8 border"
            style={{ backgroundColor: 'rgba(0,196,122,0.12)', borderColor: 'rgba(0,196,122,0.3)', color: '#4ade80' }}
          >
            <Zap className="w-3 h-3" aria-hidden="true" />
            Start in under 5 minutes
          </div>

          <h2
            id="final-cta-heading"
            className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight tracking-tight"
          >
            Manuals that are actually{' '}
            <em
              className="not-italic font-bold"
              style={{ color: 'var(--color-primary)' }}
            >
              User&#8209;friendly
            </em>
          </h2>

          <p className="text-slate-400 text-base mb-10 max-w-md mx-auto leading-relaxed">
            Join thousands of manufacturers delivering better experiences to their users.
            No credit card required.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-up" className="btn-primary text-sm">
              Get Started Free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="#"
              className="btn-outline text-sm border-slate-600 text-slate-300 hover:border-slate-400"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ────────────────────────────────────────────────────────────── */
const footerCols = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing',  href: '#pricing'  },
      { label: 'Changelog', href: '#'        },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About',   href: '#' },
      { label: 'Blog',    href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Docs',    href: '#'    },
      { label: 'FAQ',     href: '#faq' },
      { label: 'Contact', href: '#'    },
    ],
  },
]

function Footer() {
  return (
    <footer role="contentinfo" className="bg-slate-950 py-14">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-[1fr_repeat(3,auto)] gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-primary)' }}
                aria-hidden="true"
              >
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                Clear<span style={{ color: 'var(--color-primary)' }}>Guide</span>
              </span>
            </Link>
            <p className="text-xs max-w-[200px] leading-relaxed text-slate-500">
              Making product manuals accessible to everyone, everywhere.
            </p>
          </div>

          {footerCols.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-400">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="footer-link text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} ClearGuide. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy', 'Terms', 'Accessibility'].map((label) => (
              <a
                key={label}
                href="#"
                className="footer-link text-xs"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <NavBar />
      <main id="main-content">
        <Hero />
        <TrustBar />
        <FindYourGuideSection />
        <Stats />
        <WhyClearGuide />
        <PlatformFeatures />
        <BeforeAfter />
        <ManufacturerSection />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
