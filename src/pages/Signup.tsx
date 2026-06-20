import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  EnvelopeSimple,
  LockSimple,
  User,
  WarningCircle,
  Eye,
  EyeSlash,
  CheckCircle,
} from '@phosphor-icons/react'

// ─── Zod schema ────────────────────────────────────────────────────────────────

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required.')
      .min(2, 'Name must be at least 2 characters.'),
    email: z
      .string()
      .min(1, 'Email address is required.')
      .email('Please enter a valid email address.'),
    password: z
      .string()
      .min(1, 'Password is required.')
      .min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

// ─── Password strength helper ───────────────────────────────────────────────────

function getPasswordStrength(password: string) {
  if (!password) return null
  if (password.length < 6) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' }
  if (password.length < 10) return { label: 'Fair', color: 'bg-warning', width: 'w-1/2' }
  if (!/[^a-zA-Z0-9]/.test(password)) return { label: 'Good', color: 'bg-info', width: 'w-3/4' }
  return { label: 'Strong', color: 'bg-success', width: 'w-full' }
}

// ─── Field error helper ─────────────────────────────────────────────────────────

function FieldError({ id, message }: { id?: string; message?: string }) {
  return (
    <div className="min-h-[1.25rem]">
      {message && (
        <p id={id} role="alert" className="flex items-center gap-1 text-xs font-medium text-red-600">
          <WarningCircle className="size-3.5 shrink-0" />
          {message}
        </p>
      )}
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  })

  const password = watch('password')
  const strength = getPasswordStrength(password)

  const onSubmit = async (_data: SignupFormData) => {
    setFormError(null)
    try {
      // TODO: wire up axiosInstance signup call
      await new Promise(r => setTimeout(r, 1500))
      setSuccess(true)
    } catch {
      setFormError('Something went wrong. Please try again later.')
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50 mb-6">
            <CheckCircle className="size-10 text-success" weight="fill" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Account created!</h2>
          <p className="text-slate-500 text-sm mb-8">
            Welcome aboard. Your Autumn8 account is ready to use.
          </p>
          <Link to="/login">
            <Button className="w-full">Sign in to your account</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col lg:flex-row font-sans">

      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-2/5 bg-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-primary/5 blur-2xl" />

        <div className="relative z-10 max-w-sm text-center">
          <div className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <span className="text-white text-2xl font-extrabold">A</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-4 leading-snug">
            Join <span className="text-primary">Autumn8</span> and automate everything
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Build powerful AI workflows visually — drag, drop, and connect nodes to ship automations without writing a single line of code.
          </p>
          <ul className="mt-10 space-y-3 text-left">
            {[
              'Drag-and-drop workflow builder',
              'AI-powered execution nodes',
              'Real-time collaboration tools',
              'Third-party integrations via webhooks',
            ].map(item => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle className="size-5 text-success shrink-0 mt-0.5" weight="fill" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25">
              <span className="text-white font-extrabold text-base">A</span>
            </div>
            <span className="text-xl font-bold text-slate-900">Autumn8</span>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Create your account</h2>
          <p className="text-slate-500 text-sm mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline transition-colors">
              Sign in instead
            </Link>
          </p>

          {/* Form-level error banner */}
          <div
            role="alert"
            aria-live="polite"
            className={`mb-6 overflow-hidden transition-all duration-200 ${
              formError ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-4 py-3">
              <WarningCircle className="shrink-0 size-4 text-red-600 mt-0.5" />
              <p className="text-sm font-medium text-red-700">{formError}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="signup-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <User className="size-4" />
                </span>
                <Input
                  id="signup-name"
                  type="text"
                  variant="ghost"
                  className="pl-9"
                  placeholder="Jane Doe"
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'signup-name-error' : undefined}
                  autoComplete="name"
                  {...register('fullName')}
                />
              </div>
              <FieldError id="signup-name-error" message={errors.fullName?.message} />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <EnvelopeSimple className="size-4" />
                </span>
                <Input
                  id="signup-email"
                  type="email"
                  variant="ghost"
                  className="pl-9"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'signup-email-error' : undefined}
                  autoComplete="email"
                  {...register('email')}
                />
              </div>
              <FieldError id="signup-email-error" message={errors.email?.message} />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <LockSimple className="size-4" />
                </span>
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  variant="ghost"
                  className="pl-9 pr-10"
                  placeholder="Min. 6 characters"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'signup-password-error' : undefined}
                  autoComplete="new-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* Password strength bar — driven by watched field value */}
              {strength && (
                <div className="space-y-1 pt-0.5">
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Strength:{' '}
                    <span className="font-semibold text-slate-700">{strength.label}</span>
                  </p>
                </div>
              )}

              <FieldError id="signup-password-error" message={errors.password?.message} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="signup-confirm" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <LockSimple className="size-4" />
                </span>
                <Input
                  id="signup-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  variant="ghost"
                  className="pl-9 pr-10"
                  placeholder="Re-enter your password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'signup-confirm-error' : undefined}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldError id="signup-confirm-error" message={errors.confirmPassword?.message} />
            </div>

            {/* Terms notice */}
            <p className="text-xs text-slate-400 leading-relaxed">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary font-semibold hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary font-semibold hover:underline">Privacy Policy</a>.
            </p>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Autumn8. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
