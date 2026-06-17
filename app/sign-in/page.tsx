import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — ClearGuide',
  description: 'Sign in to your ClearGuide manufacturer account.',
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/manufacturer/dashboard')

  const { redirectTo } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <a href="/" className="inline-block text-2xl font-bold text-primary mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            ClearGuide
          </a>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sign in to your account to continue</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <AuthForm mode="sign-in" redirectTo={redirectTo ?? '/manufacturer/dashboard'} />
        </div>
      </div>
    </main>
  )
}
