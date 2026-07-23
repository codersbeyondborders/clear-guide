import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { EndUserSignUpForm } from '@/components/EndUserSignUpForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account — ClearGuide',
  description: 'Create a free ClearGuide account to join the community, write reviews, and use AI Chat.',
}

export default async function UserSignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>
}) {
  const user = await getUser()
  if (user) redirect('/user')

  const { returnTo } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <a
            href="/"
            className="inline-block text-2xl font-bold text-primary mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            ClearGuide
          </a>
          <h1 className="text-2xl font-bold text-foreground">Create a free account</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Join the Repair Hub, write reviews, and chat with AI support.
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <EndUserSignUpForm redirectTo={returnTo ?? '/user'} />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Are you a manufacturer?{' '}
          <a href="/sign-up" className="text-primary hover:underline focus-visible:outline-none">
            Sign up here
          </a>
        </p>
      </div>
    </main>
  )
}
