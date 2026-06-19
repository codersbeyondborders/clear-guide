import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up — ClearGuide',
  description: 'Create a ClearGuide manufacturer account and publish your first manual in minutes.',
}

export default async function SignUpPage() {
  const user = await getUser()
  if (user) redirect('/manufacturer/dashboard')

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <a href="/" className="inline-block text-2xl font-bold text-primary mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            ClearGuide
          </a>
          <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
          <p className="text-muted-foreground mt-1 text-sm">Start publishing accessible manuals today</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <AuthForm mode="sign-up" />
        </div>
      </div>
    </main>
  )
}
