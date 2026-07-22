import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — ClearGuide',
  description: 'Sign in to your ClearGuide account to access forums, AI Chat, and community features.',
}

export default async function UserSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>
}) {
  const user = await getUser()
  if (user) redirect('/user')

  const { returnTo } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <a
            href="/"
            className="inline-block text-2xl font-bold text-primary mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            ClearGuide
          </a>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sign in to access forums and AI Chat features.
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <AuthForm
            mode="sign-in"
            redirectTo={returnTo ?? '/user'}
            userType="end_user"
          />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Are you a manufacturer?{' '}
          <a href="/sign-in" className="text-primary hover:underline focus-visible:outline-none">
            Sign in here
          </a>
        </p>
      </div>
    </main>
  )
}
