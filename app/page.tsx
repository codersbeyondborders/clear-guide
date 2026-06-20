import Link from 'next/link'
import {
  LayoutDashboard, MessageSquare, QrCode, BarChart3,
  ArrowRight, Check, FileText, Globe, Sparkles,
  BookOpen, Upload, Zap, ChevronRight,
} from 'lucide-react'

/* ─── Nav ──────────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <nav
        className="container flex h-16 items-center justify-between"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="ClearGuide home"
        >
          <div
            className="w-7 h-7 rounded-md bg-primary flex items-center justify-center"
            aria-hidden="true"
          >
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold text-foreground">ClearGuide</span>
        </Link>

        <div
          className="hidden md:flex items-center gap-8 text-sm font-medium"
          role="list"
        >
          {(['Features', 'How it works', 'Pricing'] as const).map((label) => (
            <a
              key={label}
              role="listitem"
              href={`#${label.toLowerCase().replace(/ /g, '-')}`}
              className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="btn-ghost hidden sm:inline-flex text-sm"
          >
            Sign in
          </Link>
          <Link href="/sign-up" className="btn-primary text-sm">
            Get started
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </header>
  )
}

/* ─── Hero ─────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      className="py-20 md:py-32 border-b border-border"
      aria-labelledby="hero-heading"
    >
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          {/* Announcement pill */}
          <a
            href="#features"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-subtle border border-primary/20 text-primary text-xs font-semibold mb-8 hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            AI-Powered Manual Platform
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </a>

          <h1
            id="hero-heading"
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground tracking-tight leading-none mb-6"
          >
            Your manuals,{' '}
            <span className="text-primary">finally useful</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            Turn static product guides into accessible, AI-powered experiences.
            50+ languages, instant chat support, and QR integration — out of the box.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="btn-primary px-7 py-3 text-base"
            >
              Start for free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className="btn-outline px-7 py-3 text-base"
            >
              See how it works
            </a>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-xs text-muted-foreground">
            No credit card required &nbsp;·&nbsp; WCAG 2.1 AA compliant &nbsp;·&nbsp; SOC 2 ready
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─── Stats ─────────────────────────────────────────────────────────────── */
const stats: { value: string; label: string }[] = [
  { value: '10,000+', label: 'Manuals published' },
  { value: '98%',     label: 'Accessibility score' },
  { value: '300+',    label: 'Manufacturers' },
  { value: '50+',     label: 'Languages supported' },
]

function Stats() {
  return (
    <section
      className="border-b border-border bg-background-subtle"
      aria-label="Platform statistics"
    >
      <div className="container py-12">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <dt className="text-3xl font-bold text-foreground tabular-nums">
                {s.value}
              </dt>
              <dd className="text-sm text-muted-foreground">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ─── Features ──────────────────────────────────────────────────────────── */
const features: {
  icon: React.ElementType
  title: string
  description: string
}[] = [
  {
    icon: LayoutDashboard,
    title: 'Manufacturer Dashboard',
    description:
      'Manage all your manuals from one place. Track status, languages, and publishing in a clean, organised view.',
  },
  {
    icon: MessageSquare,
    title: 'AI Chat Support',
    description:
      'Users get instant, contextual answers from the manual. No more support calls for basic how-to questions.',
  },
  {
    icon: QrCode,
    title: 'QR Code Integration',
    description:
      'Generate and print QR codes for any product. Users scan and access the exact guide they need instantly.',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description:
      'Understand how users engage with your content. Track views, time spent, and most-used sections.',
  },
  {
    icon: Globe,
    title: 'Multi-language',
    description:
      'AI-powered translation into 50+ languages. Publish once, reach everyone — with human-quality output.',
  },
  {
    icon: BookOpen,
    title: 'Accessible by Default',
    description:
      'High-contrast mode, adjustable font sizes, screen reader support, and WCAG 2.1 AA compliance built in.',
  },
]

function Features() {
  return (
    <section
      id="features"
      className="py-24"
      aria-labelledby="features-heading"
    >
      <div className="container">
        <header className="mb-14">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-subtle text-primary text-xs font-semibold mb-4">
            Features
          </div>
          <h2
            id="features-heading"
            className="text-3xl md:text-4xl font-bold text-foreground max-w-xl"
          >
            Everything you need to ship great manuals
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg leading-relaxed">
            From creation to publishing to analytics — ClearGuide covers the full lifecycle.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <article
              key={f.title}
              className="card p-6 hover:border-border-strong hover:shadow-sm transition-all duration-200 group"
            >
              <div
                className="w-9 h-9 rounded-lg bg-primary-subtle flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors"
                aria-hidden="true"
              >
                <f.icon className="w-[18px] h-[18px] text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── How it works ──────────────────────────────────────────────────────── */
const steps: {
  icon: React.ElementType
  step: string
  title: string
  description: string
}[] = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload your manual',
    description:
      'Upload a PDF or build your guide section by section directly in the editor.',
  },
  {
    icon: Zap,
    step: '02',
    title: 'AI processes it',
    description:
      'Our AI extracts structure, generates translations, and builds the knowledge base for chat.',
  },
  {
    icon: FileText,
    step: '03',
    title: 'Publish and share',
    description:
      'Share a link, generate a QR code, or embed the viewer directly on your product page.',
  },
]

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-background-subtle border-y border-border"
      aria-labelledby="how-heading"
    >
      <div className="container">
        <header className="mb-14">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-subtle text-primary text-xs font-semibold mb-4">
            How it works
          </div>
          <h2
            id="how-heading"
            className="text-3xl md:text-4xl font-bold text-foreground max-w-xl"
          >
            From upload to published in minutes
          </h2>
        </header>

        <ol className="grid md:grid-cols-3 gap-8 relative" aria-label="Steps to get started">
          {steps.map((s, i) => (
            <li key={s.step} className="relative flex flex-col">
              {/* Step number + icon */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm"
                  aria-hidden="true"
                >
                  <s.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span
                  className="text-5xl font-bold text-border-strong leading-none select-none tabular-nums"
                  aria-hidden="true"
                >
                  {s.step}
                </span>
              </div>

              {/* Connector line — decorative */}
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-5 left-[calc(100%_-_1.5rem)] w-12 h-px bg-border-strong"
                  aria-hidden="true"
                />
              )}

              <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ─── Pricing ───────────────────────────────────────────────────────────── */
const plans: {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  href: string
  highlight: boolean
}[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individuals and small teams getting started.',
    features: [
      'Up to 3 manuals',
      '2 languages per manual',
      'Basic analytics',
      'QR code generation',
    ],
    cta: 'Get started',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For growing teams who need more power and reach.',
    features: [
      'Unlimited manuals',
      '20 languages per manual',
      'Advanced analytics',
      'AI chat support',
      'Custom branding',
      'Priority support',
    ],
    cta: 'Start free trial',
    href: '/sign-up',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large manufacturers with custom requirements.',
    features: [
      'Everything in Pro',
      'Unlimited languages',
      'SSO & audit logs',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
    ],
    cta: 'Contact sales',
    href: 'mailto:sales@clearguide.io',
    highlight: false,
  },
]

function Pricing() {
  return (
    <section
      id="pricing"
      className="py-24"
      aria-labelledby="pricing-heading"
    >
      <div className="container">
        <header className="mb-14">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-subtle text-primary text-xs font-semibold mb-4">
            Pricing
          </div>
          <h2
            id="pricing-heading"
            className="text-3xl md:text-4xl font-bold text-foreground"
          >
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground mt-2">
            Start free. Upgrade when you need more.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl">
          {plans.map((plan) => (
            <article
              key={plan.name}
              aria-label={`${plan.name} plan`}
              className={`card p-7 flex flex-col gap-6 ${
                plan.highlight
                  ? 'border-primary ring-1 ring-primary'
                  : ''
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-base font-bold text-foreground">
                    {plan.name}
                  </h3>
                  {plan.highlight && (
                    <span className="badge badge-green text-xs">
                      Most popular
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground tabular-nums">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      /{plan.period}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-border" role="separator" />

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1" aria-label={`${plan.name} plan features`}>
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check
                      className="w-4 h-4 text-primary shrink-0"
                      aria-hidden="true"
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={
                  plan.highlight
                    ? 'btn-primary text-center text-sm'
                    : 'btn-outline text-center text-sm'
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

/* ─── CTA Banner ────────────────────────────────────────────────────────── */
function CTABanner() {
  return (
    <section
      className="py-20 bg-primary-subtle border-t border-border"
      aria-labelledby="cta-heading"
    >
      <div className="container text-center">
        <h2
          id="cta-heading"
          className="text-3xl md:text-4xl font-bold text-foreground mb-4"
        >
          Ready to make your manuals work harder?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          Join 300+ manufacturers already using ClearGuide to delight their customers.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/sign-up" className="btn-primary px-7 py-3 text-base">
            Get started free
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link href="/sign-in" className="btn-outline px-7 py-3 text-base">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ────────────────────────────────────────────────────────────── */
const footerLinks = [
  { label: 'About', href: '#' },
  { label: 'Docs', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
]

function Footer() {
  return (
    <footer
      className="border-t border-border py-10"
      role="contentinfo"
    >
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md bg-primary flex items-center justify-center"
            aria-hidden="true"
          >
            <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground">ClearGuide</span>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} ClearGuide. All rights reserved.
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap items-center gap-5">
            {footerLinks.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTABanner />
      </main>
      <Footer />
    </>
  )
}
