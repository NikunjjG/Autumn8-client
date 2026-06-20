import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { EnvelopeSimple, LockSimple, WarningCircle, Eye, EyeSlash } from '@phosphor-icons/react'

// ─── Zod schema ────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required.')
    .email('Please enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Password is required.')
    .min(6, 'Password must be at least 6 characters.'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

// ─── Field error helper ─────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  return (
    <div className="min-h-[1.25rem]">
      {message && (
        <p role="alert" className="flex items-center gap-1 text-xs font-medium text-red-600">
          <WarningCircle className="size-3.5 shrink-0" />
          {message}
        </p>
      )}
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const rememberMe = watch('rememberMe')

  const onSubmit = async (_data: LoginFormData) => {
    setFormError(null)
    try {
      // TODO: wire up axiosInstance login call
      await new Promise(r => setTimeout(r, 1200))
      // navigate('/dashboard')
    } catch {
      setFormError('Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col lg:flex-row font-sans">

      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-primary/5 blur-2xl" />

        <div className="relative z-10 max-w-md text-center">
          <div className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <span className="text-white text-2xl font-extrabold">A</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            Welcome back to <span className="text-primary">Autumn8</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Build powerful automations visually — wire up nodes like blueprints, ship workflows without writing a single line of code.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[['10k+', 'Workflows'], ['Zero', 'Code needed'], ['∞', 'Possibilities']].map(
              ([stat, label]) => (
                <div key={label}>
                  <p className="text-3xl font-bold text-white">{stat}</p>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mt-1">{label}</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25">
              <span className="text-white font-extrabold text-base">A</span>
            </div>
            <span className="text-xl font-bold text-slate-900">Autumn8</span>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Sign in to Autumn8</h2>
          <p className="text-slate-500 text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline transition-colors">
              Create one free
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

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <EnvelopeSimple className="size-4" />
                </span>
                <Input
                  id="login-email"
                  type="email"
                  variant="ghost"
                  className="pl-9"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
                  autoComplete="email"
                  {...register('email')}
                />
              </div>
              <FieldError message={errors.email?.message} />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Password
                </label>
                <a href="#" className="text-xs text-primary font-semibold hover:underline transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <LockSimple className="size-4" />
                </span>
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  variant="ghost"
                  className="pl-9 pr-10"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  autoComplete="current-password"
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
              <FieldError message={errors.password?.message} />
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="login-remember"
                checked={!!rememberMe}
                onCheckedChange={checked => setValue('rememberMe', !!checked)}
              />
              <label htmlFor="login-remember" className="text-sm text-slate-600 select-none cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
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
