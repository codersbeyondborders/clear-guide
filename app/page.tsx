import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen, ChevronRight, Check, X, Star,
  Shield, MessageSquare, Globe, Volume2,
  LayoutDashboard, QrCode, ChevronDown, Zap,
} from 'lucide-react'
import { FindYourGuideSection } from '@/components/FindYourGuideSection'
import { NavBar } from '@/components/NavBar'

/* ─── Hero ─────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      className="bg-background overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="container">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center py-14 md:py-20">
          {/* Left — text */}
          <div className="order-2 md:order-1">
            {/* Pill badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-6 border"
              style={{
                backgroundColor: 'var(--color-primary-subtle)',
                borderColor: 'color-mix(in srgb, var(--color-primary) 25%, transparent)',
                color: 'var(--color-primary)',
              }}
            >
              <Zap className="w-3 h-3" aria-hidden="true" />
              AI-Powered Manual Platform
            </div>

            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] mb-5"
            >
              Your Manuals,{' '}
              <span style={{ color: 'var(--color-primary)' }}>Simplified</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-[440px]">
              Replace paper manuals with accessible, AI-powered digital guides.
              Designed for everyone — high contrast, audio support, and instant
              AI chat.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className="btn-primary text-sm"
                style={{ borderRadius: '9999px', paddingInline: '1.25rem', paddingBlock: '0.625rem' }}
              >
                Get Started Free
              </Link>
              <a
                href="#features"
                className="btn-outline text-sm"
                style={{ borderRadius: '9999px', paddingInline: '1.25rem', paddingBlock: '0.625rem' }}
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right — illustration */}
          <div
            className="order-1 md:order-2 rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          >
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

/* ─── Stats Bar ─────────────────────────────────────────────────────────── */
const stats = [
  { value: '10K+', label: 'Manuals Published' },
  { value: '98%',  label: 'Accessibility Score' },
  { value: '5K+',  label: 'Active Users' },
  { value: '300+', label: 'Manufacturers' },
]

function Stats() {
  return (
    <section
      aria-label="Platform statistics"
      style={{ backgroundColor: '#1e293b' }}
    >
      <div className="container py-8">
        <dl className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col items-center gap-1 py-2 text-center ${i < stats.length - 1 ? 'md:border-r' : ''}`}
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <dt className="text-3xl md:text-4xl font-bold tabular-nums tracking-tight" style={{ color: '#ffffff' }}>
                {s.value}
              </dt>
              <dd className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</dd>
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
    title: 'WCAG 2.2 AAA',
    description: 'Our guides are fully accessible on all users with any visual digital manual.',
  },
  {
    icon: MessageSquare,
    title: 'Instant AI Answers',
    description: 'Contextual AI chat answers any question in your language and get instant answers from the manual.',
  },
  {
    icon: Globe,
    title: 'Multi-language Support',
    description: 'AI-generated translations in 50+ languages with automatic translation.',
  },
  {
    icon: Volume2,
    title: 'Audio Descriptions',
    description: 'Text-to-speech and image narration for screen reader users.',
  },
]

function WhyClearGuide() {
  return (
    <section
      className="py-16 md:py-20"
      style={{ backgroundColor: 'var(--color-background-subtle)' }}
      aria-labelledby="why-heading"
    >
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div className="md:pt-2">
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>Why ClearGuide?</p>
            <h2
              id="why-heading"
              className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4"
            >
              The Smarter Choice for Accessible Manuals
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              Traditional paper manuals exclude millions of users. ClearGuide transforms
              them into living, accessible digital experiences that work for everyone.
            </p>
          </div>

          {/* Right — 2×2 feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyFeatures.map((f) => (
              <article key={f.title} className="card p-5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: 'var(--color-primary-subtle)' }}
                  aria-hidden="true"
                >
                  <f.icon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
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
    badgeClass: 'badge-green',
    title: 'Accessible Manual Viewer',
    description:
      'High contrast mode, adjustable font sizes, and full keyboard navigation built in from day one.',
  },
  {
    icon: MessageSquare,
    badge: 'AI-Powered',
    badgeClass: 'badge-green',
    title: 'AI Chat Support',
    description:
      'Ask any question and get instant, accurate answers from the manual.',
  },
  {
    icon: LayoutDashboard,
    badge: 'Analytics',
    badgeClass: 'badge-slate',
    title: 'Manufacturer Dashboard',
    description:
      'Upload, edit, and publish manuals. Track engagement analytics in real time.',
  },
  {
    icon: QrCode,
    badge: 'Integration',
    badgeClass: 'badge-slate',
    title: 'Smart QR Integration',
    description:
      'Print a QR code on your product. Users scan and are directed to the right manual.',
  },
]

function PlatformFeatures() {
  return (
    <section
      id="features"
      className="py-16 md:py-20 bg-background"
      aria-labelledby="platform-heading"
    >
      <div className="container">
        <header className="text-center mb-10">
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>Platform Features</p>
          <h2
            id="platform-heading"
            className="text-3xl md:text-4xl font-bold text-foreground"
          >
            Tools to Elevate Your Manuals
          </h2>
        </header>

        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {platformFeatures.map((f) => (
            <article
              key={f.title}
              className="card p-6 flex items-start gap-4 hover:shadow-sm transition-shadow"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-primary-subtle)' }}
                aria-hidden="true"
              >
                <f.icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                  <span className={`badge ${f.badgeClass} text-xs`}>{f.badge}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
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
  'Manual lost or thrown away with the packaging',
  'No help when a step is confusing or unclear',
  'Diagrams with no explanation for visually impaired users',
  'Manuals only available in one language',
  'Calling support for basic setup questions',
]

const withList = [
  'Adjustable font sizes and high contrast mode built in',
  'Always accessible via QR code or product search',
  'Instant AI chat answers any question in plain language',
  'Audio descriptions and text-to-speech for every section',
  'Auto translated into 16 languages at the tap of a button',
  'Voice activated AI answers hands-free, 24/7',
]

function BeforeAfter() {
  return (
    <section
      className="py-16 md:py-20"
      style={{ backgroundColor: 'var(--color-background-subtle)' }}
      aria-labelledby="ba-heading"
    >
      <div className="container">
        <header className="text-center mb-10">
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>The Difference</p>
          <h2
            id="ba-heading"
            className="text-3xl md:text-4xl font-bold text-foreground mb-3"
          >
            Before &amp; After ClearGuide
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            See how the experience changes when manuals are built for people, not paper.
          </p>
        </header>

        {/* Photos with overlay labels */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10 max-w-3xl mx-auto">
          <figure className="relative rounded-2xl overflow-hidden">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/before-ftzlTJ2qEGFIpK2fQR4hTJ87Yd62ZC.webp"
              alt="Elderly woman struggling to read a tiny paper manual with a magnifying glass"
              width={600}
              height={400}
              className="w-full object-cover"
              style={{ height: '14rem' }}
            />
            <div className="absolute bottom-3 left-3">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  color: 'var(--color-destructive)',
                  borderColor: 'color-mix(in srgb, var(--color-destructive) 20%, transparent)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <X className="w-3 h-3" aria-hidden="true" />
                Without ClearGuide
              </span>
            </div>
          </figure>
          <figure className="relative rounded-2xl overflow-hidden">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/after-Fxe8lwx6J74SmS3LZvmRS5ye0R8CqI.webp"
              alt="Same woman now smiling, holding a phone showing the ClearGuide digital manual for the coffee maker"
              width={600}
              height={400}
              className="w-full object-cover"
              style={{ height: '14rem' }}
            />
            <div className="absolute bottom-3 left-3">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  color: 'var(--color-primary)',
                  borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <Check className="w-3 h-3" aria-hidden="true" />
                #WithClearGuide
              </span>
            </div>
          </figure>
        </div>

        {/* Comparison lists */}
        <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Without ClearGuide</h3>
            <ul className="flex flex-col gap-3" aria-label="Problems without ClearGuide">
              {withoutList.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <X
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: 'var(--color-destructive)' }}
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">With ClearGuide</h3>
            <ul className="flex flex-col gap-3" aria-label="Benefits with ClearGuide">
              {withList.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
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
  'PDF & Word import',
  'Auto-generated QR codes',
  'Real-time analytics',
  'Multi-product management',
]

function ManufacturerSection() {
  return (
    <section
      className="py-16 md:py-20"
      style={{ backgroundColor: 'var(--color-primary-subtle)' }}
      aria-labelledby="mfr-heading"
    >
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>For Manufacturers</p>
            <h2
              id="mfr-heading"
              className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4"
            >
              Seamless Integration with Your Workflow
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm mb-6">
              Upload your existing PDF manuals to create new ones from scratch.
              ClearGuide automatically structures content, adds accessibility features,
              and generates AI training data — all in minutes.
            </p>

            <ul className="flex flex-col gap-3 mb-8" aria-label="Manufacturer benefits">
              {manufacturerBenefits.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-foreground">
                  <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>

            <Link
              href="/sign-up"
              className="btn-primary inline-flex text-sm gap-1"
              style={{ borderRadius: '9999px', paddingInline: '1.25rem', paddingBlock: '0.625rem' }}
            >
              Start for Free
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Right — mini dashboard mockup */}
          <div className="card p-6 bg-background shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-semibold text-foreground">Analytics Overview</span>
              <span className="badge badge-green text-xs flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  aria-hidden="true"
                />
                Live
              </span>
            </div>

            {/* Bar chart mockup */}
            <div
              className="flex items-end gap-1.5 mb-5"
              style={{ height: '7rem' }}
              role="img"
              aria-label="Bar chart showing increasing manual views over 7 days"
            >
              {[35, 50, 42, 65, 55, 90, 75].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${h}%`,
                    backgroundColor: 'var(--color-primary)',
                    opacity: i === 5 ? 1 : 0.4,
                  }}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-xl border p-3"
                style={{ backgroundColor: 'var(--color-background-subtle)', borderColor: 'var(--color-border)' }}
              >
                <p className="text-xl font-bold text-foreground">7 days</p>
                <p className="text-xs text-muted-foreground mt-0.5">Avg. setup time</p>
              </div>
              <div
                className="rounded-xl p-3"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <p className="text-xl font-bold" style={{ color: 'var(--color-primary-foreground)' }}>24/7</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-primary-foreground)', opacity: 0.8 }}>AI Support</p>
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
    quote: '"ClearGuide cut our support tickets by 40%. Users actually understand their product now."',
    name: 'Sarah M.',
    role: 'Head of Manufacturing',
    rating: 5,
  },
  {
    quote: '"The only manual platform that takes WCAG seriously. The high-contrast mode is flawless."',
    name: 'James T.',
    role: 'Accessibility Lead, CiAB',
    rating: 5,
  },
  {
    quote: '"I have low vision and this is the first manual I could actually read without help. Amazing."',
    name: 'Priya K.',
    role: 'End User',
    rating: 5,
  },
]

function Testimonials() {
  return (
    <section
      className="py-16 md:py-20 bg-background"
      aria-labelledby="testimonials-heading"
    >
      <div className="container">
        <header className="text-center mb-10">
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>Testimonials</p>
          <h2
            id="testimonials-heading"
            className="text-3xl md:text-4xl font-bold text-foreground"
          >
            Real Results from Real Users
          </h2>
        </header>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <article key={t.name} className="card p-6 flex flex-col gap-4">
              <div
                className="flex items-center gap-0.5"
                aria-label={`${t.rating} out of 5 stars`}
              >
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4"
                    style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)' }}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <blockquote className="text-sm text-foreground leading-relaxed flex-1">
                {t.quote}
              </blockquote>

              <footer
                className="flex items-center gap-3 pt-2"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: 'var(--color-primary-subtle)',
                    color: 'var(--color-primary)',
                  }}
                  aria-hidden="true"
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
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
    features: ['Up to 3 manuals', 'Accessibility features', 'QR code generation', 'Community support'],
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
    features: ['Everything in Pro', 'Custom branding', 'SSO & team management', 'Dedicated account manager'],
    cta: 'Contact Sales',
    href: 'mailto:sales@clearguide.io',
    highlight: false,
  },
]

function Pricing() {
  return (
    <section
      id="pricing"
      className="py-16 md:py-20"
      style={{ backgroundColor: 'var(--color-background-subtle)' }}
      aria-labelledby="pricing-heading"
    >
      <div className="container">
        <header className="mb-10">
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>Pricing</p>
          <h2
            id="pricing-heading"
            className="text-3xl md:text-4xl font-bold text-foreground"
          >
            Plans That Fit Your Journey
          </h2>
        </header>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl">
          {plans.map((plan) => (
            <article
              key={plan.name}
              aria-label={`${plan.name} plan`}
              className="rounded-2xl p-7 flex flex-col gap-5"
              style={
                plan.highlight
                  ? { backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }
                  : { backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }
              }
            >
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wide mb-1"
                  style={{ color: plan.highlight ? 'rgba(255,255,255,0.5)' : 'var(--color-muted-foreground)' }}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span
                    className="text-4xl font-bold tabular-nums"
                    style={{ color: plan.highlight ? '#ffffff' : 'var(--color-foreground)' }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className="text-sm"
                      style={{ color: plan.highlight ? 'rgba(255,255,255,0.5)' : 'var(--color-muted-foreground)' }}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: plan.highlight ? 'rgba(255,255,255,0.5)' : 'var(--color-muted-foreground)' }}
                >
                  {plan.description}
                </p>
              </div>

              <div
                role="separator"
                style={{ borderTop: `1px solid ${plan.highlight ? 'rgba(255,255,255,0.1)' : 'var(--color-border)'}` }}
              />

              <ul className="flex flex-col gap-2.5 flex-1" aria-label={`${plan.name} plan features`}>
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm"
                    style={{ color: plan.highlight ? 'rgba(255,255,255,0.85)' : 'var(--color-foreground)' }}
                  >
                    <Check
                      className="w-4 h-4 shrink-0"
                      style={{ color: 'var(--color-primary)' }}
                      aria-hidden="true"
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={plan.highlight ? 'btn-primary text-center text-sm' : 'btn-outline text-center text-sm'}
                style={
                  plan.highlight
                    ? { borderRadius: '9999px', backgroundColor: '#ffffff', color: '#1e293b' }
                    : { borderRadius: '9999px' }
                }
              >
                {plan.cta}
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
    a: 'AI chat support is available on the Pro plan and above. Free plan users get basic manual access without the chat feature.',
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
      className="py-16 md:py-20 bg-background"
      aria-labelledby="faq-heading"
    >
      <div className="container">
        <div className="grid md:grid-cols-[260px_1fr] gap-12 items-start">
          {/* Left */}
          <div className="md:sticky md:top-24">
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>FAQ</p>
            <h2
              id="faq-heading"
              className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-6"
            >
              Frequently Asked Questions
            </h2>
            <Link
              href="/sign-up"
              className="btn-primary inline-flex text-sm"
              style={{ borderRadius: '9999px', paddingInline: '1.25rem', paddingBlock: '0.625rem' }}
            >
              Contact Us
            </Link>
          </div>

          {/* Right — accordion */}
          <div className="flex flex-col" style={{ borderTop: '1px solid var(--color-border)' }}>
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="py-5"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <details className="group">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                    <span className="text-sm font-semibold text-foreground">{faq.q}</span>
                    <ChevronDown
                      className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
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
      className="py-16 md:py-24"
      style={{ backgroundColor: 'var(--color-background-subtle)', borderTop: '1px solid var(--color-border)' }}
      aria-labelledby="final-cta-heading"
    >
      <div className="container text-center">
        <h2
          id="final-cta-heading"
          className="text-3xl md:text-5xl font-bold text-foreground mb-3 leading-tight"
        >
          User Manuals that are actually{' '}
          <em className="not-italic font-bold italic" style={{ color: 'var(--color-primary)' }}>
            User&#8209;friendly
          </em>
        </h2>
        <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
          Join thousands of Manufacturers Delivering Better Experiences to Their Users.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="btn-primary text-sm"
            style={{ borderRadius: '9999px', paddingInline: '1.5rem', paddingBlock: '0.625rem' }}
          >
            Get Started Free
          </Link>
          <Link
            href="#"
            className="btn-outline text-sm"
            style={{ borderRadius: '9999px', paddingInline: '1.5rem', paddingBlock: '0.625rem' }}
          >
            Book a Demo
          </Link>
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
      { label: 'Pricing', href: '#pricing' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Docs', href: '#' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Contact', href: '#' },
    ],
  },
]

function Footer() {
  return (
    <footer
      role="contentinfo"
      className="py-12"
      style={{ backgroundColor: '#1e293b' }}
    >
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-[1fr_repeat(3,auto)] gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3 w-fit">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
                aria-hidden="true"
              >
                <BookOpen className="w-4 h-4" style={{ color: 'var(--color-primary-foreground)' }} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-bold" style={{ color: '#ffffff' }}>Clear</span>
                <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>Guide</span>
              </div>
            </Link>
            <p className="text-xs max-w-[200px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Making product manuals accessible to everyone.
            </p>
          </div>

          {footerCols.map((col) => (
            <div key={col.heading}>
              <h3
                className="text-xs font-bold uppercase tracking-wide mb-3"
                style={{ color: '#ffffff' }}
              >
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2">
                {col.links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="footer-link text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            &copy; {new Date().getFullYear()} ClearGuide. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Privacy', 'Terms'].map((label) => (
              <a
                key={label}
                href="#"
                className="footer-link text-xs transition-colors"
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
