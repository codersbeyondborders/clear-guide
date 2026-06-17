import Link from 'next/link'
import {
  LayoutDashboard, MessageSquare, QrCode, BarChart3,
  ArrowRight, Check, FileText, Globe, Sparkles,
  BookOpen, Upload, Zap,
} from 'lucide-react'

/* ─── Nav ──────────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <nav className="container flex h-16 items-center justify-between" aria-label="Main navigation">
        <Link href="/" className="text-xl font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
          ClearGuide
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="btn-ghost hidden sm:inline-flex">
            Sign in
          </Link>
          <Link href="/sign-up" className="btn-primary">
            Get started
          </Link>
        </div>
      </nav>
    </header>
  )
}

/* ─── Hero ─────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-subtle border border-primary/20 text-primary text-xs font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            AI-Powered Manual Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6">
            Your Manuals,{' '}
            <span className="text-primary">Simplified</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            Create accessible, AI-powered product guides in minutes. High-contrast mode, 50+ languages, QR integration, and instant AI chat support.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-up" className="btn-primary px-8 py-3 text-base">
              Get started free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a href="#how-it-works" className="btn-outline px-8 py-3 text-base">
              See how it works
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Stats ─────────────────────────────────────────────────────────────── */
const stats = [
  { value: '10,000+', label: 'Manuals published' },
  { value: '98%',     label: 'Accessibility score' },
  { value: '300+',    label: 'Manufacturers' },
  { value: '50+',     label: 'Languages supported' },
]

function Stats() {
  return (
    <section className="border-y border-border bg-background-subtle" aria-label="Product statistics">
      <div className="container py-12">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block text-3xl font-bold text-foreground">{s.value}</span>
                <span className="text-sm text-muted-foreground mt-1 block">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ─── Features ──────────────────────────────────────────────────────────── */
const features = [
  {
    icon: LayoutDashboard,
    title: 'Manufacturer Dashboard',
    description: 'Manage all your manuals from one place. Track status, languages, and publishing in a clean, organised view.',
  },
  {
    icon: MessageSquare,
    title: 'AI Chat Support',
    description: 'Users get instant, contextual answers from the manual. No more support calls for basic how-to questions.',
  },
  {
    icon: QrCode,
    title: 'QR Code Integration',
    description: 'Generate and print QR codes for any product. Users scan and access the exact guide they need instantly.',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Understand how users engage with your content. Track views, time spent, and most-used sections.',
  },
  {
    icon: Globe,
    title: 'Multi-language',
    description: 'AI-powered translation into 50+ languages. Publish once, reach everyone — with human-quality output.',
  },
  {
    icon: BookOpen,
    title: 'Accessible by Default',
    description: 'High-contrast mode, adjustable font sizes, screen reader support, and WCAG 2.1 AA compliance built in.',
  },
]

function Features() {
  return (
    <section id="features" className="py-24" aria-labelledby="features-heading">
      <div className="container">
        <div className="text-center mb-16">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-foreground">
            Everything you need to ship great manuals
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            From creation to publishing to analytics — ClearGuide covers the full lifecycle.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <article
              key={f.title}
              className="card hover:border-border-strong hover:shadow-sm transition-all duration-150 p-6"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-subtle flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── How it works ──────────────────────────────────────────────────────── */
const steps = [
  { icon: Upload, step: '01', title: 'Upload your manual', description: 'Upload a PDF or build your guide section by section directly in the editor.' },
  { icon: Zap,    step: '02', title: 'AI processes it',   description: 'Our AI extracts structure, generates translations, and builds the knowledge base for chat.' },
  { icon: FileText, step: '03', title: 'Publish and share', description: 'Share a link, generate a QR code, or embed the viewer directly on your product page.' },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background-subtle border-y border-border" aria-labelledby="how-heading">
      <div className="container">
        <div className="text-center mb-16">
          <h2 id="how-heading" className="text-3xl md:text-4xl font-bold text-foreground">
            From upload to published in minutes
          </h2>
        </div>

        <ol className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <li key={s.step} className="flex flex-col items-start">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
                </div>
                <span className="text-4xl font-bold text-border-strong select-none" aria-hidden="true">
                  {s.step}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute translate-x-full" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ─── Pricing ───────────────────────────────────────────────────────────── */
const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individuals and small teams getting started.',
    features: ['Up to 3 manuals', '2 languages per manual', 'Basic analytics', 'QR code generation'],
    cta: 'Get started',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For growing teams who need more power and languages.',
    features: ['Unlimited manuals', '20 languages per manual', 'Advanced analytics', 'AI chat support', 'Custom branding', 'Priority support'],
    cta: 'Start free trial',
    href: '/sign-up',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large manufacturers with custom requirements.',
    features: ['Everything in Pro', 'Unlimited languages', 'SSO & audit logs', 'Dedicated support', 'SLA guarantee', 'Custom integrations'],
    cta: 'Contact sales',
    href: 'mailto:sales@clearguide.io',
    highlight: false,
  },
]

function Pricing() {
  return (
    <section id="pricing" className="py-24" aria-labelledby="pricing-heading">
      <div className="container">
        <div className="text-center mb-16">
          <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`card p-6 flex flex-col gap-6 ${
                plan.highlight
                  ? 'border-primary ring-1 ring-primary shadow-md'
                  : ''
              }`}
            >
              {plan.highlight && (
                <div className="badge badge-green self-start">Most popular</div>
              )}
              <div>
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{plan.description}</p>
              </div>

              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={plan.highlight ? 'btn-primary text-center' : 'btn-outline text-center'}
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

/* ─── Footer ────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-border py-12" role="contentinfo">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-lg font-bold text-primary">ClearGuide</span>
          <p className="text-xs text-muted-foreground mt-1">
            &copy; {new Date().getFullYear()} ClearGuide. All rights reserved.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {['About', 'Docs', 'Privacy', 'Terms'].map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                  {link}
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
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </>
  )
}
