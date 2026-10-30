import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Sparkles,
  User,
  UserPlus,
  ShieldCheck,
} from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { ApiError, errorMessage } from '@/lib/api'
import { safeRedirect } from '@/lib/redirect'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

const emailSchema = z.email('Escribe un correo válido.').max(254, 'El correo es demasiado largo.')

const maxPasswordBytes = (value: string) => new TextEncoder().encode(value).length <= 72

const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Escribe tu contraseña.')
    .refine(maxPasswordBytes, 'La contraseña no puede pasar de 72 caracteres.'),
})

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Tu usuario debe tener al menos 3 caracteres.')
    .max(32, 'Tu usuario no puede pasar de 32 caracteres.'),
  email: emailSchema,
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .refine(maxPasswordBytes, 'La contraseña no puede pasar de 72 caracteres.'),
})

type FieldName = 'name' | 'email' | 'password'

const inputBase =
  'border-line bg-base placeholder:text-muted h-11 w-full rounded-xl border text-sm transition-colors focus:border-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

export function AuthView({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState<FieldName | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const isLogin = mode === 'login'

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!error) return
    const target =
      errorField === 'name'
        ? nameRef.current
        : errorField === 'email'
          ? emailRef.current
          : errorField === 'password'
            ? passwordRef.current
            : errorRef.current
    target?.focus()
  }, [error, errorField])

  const clearError = () => {
    if (!error) return
    setError('')
    setErrorField(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setErrorField(null)

    const result = isLogin
      ? loginSchema.safeParse({ email, password })
      : registerSchema.safeParse({ name, email, password })

    if (!result.success) {
      const issue = result.error.issues[0]
      const field = String(issue?.path[0] ?? '')
      setError(issue?.message ?? 'Revisa los datos.')
      setErrorField(field === 'name' || field === 'email' || field === 'password' ? field : null)
      return
    }

    setSubmitting(true)
    try {
      if (isLogin) await login(email.trim(), password)
      else await register(name.trim(), email.trim(), password)
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 409) {
        setError('Ese email o usuario ya existe.')
      } else if (caught instanceof ApiError && caught.status === 401) {
        setError('El correo o la contraseña no son correctos.')
      } else {
        setError(
          errorMessage(
            caught,
            isLogin ? 'No pudimos iniciar sesión.' : 'No pudimos crear tu cuenta.',
          ),
        )
      }
      setErrorField(null)
      return
    } finally {
      setSubmitting(false)
    }

    toast.success(isLogin ? 'Bienvenido de vuelta' : 'Cuenta creada')
    navigate(safeRedirect(searchParams.get('next')), { replace: true })
  }

  const nextParam = searchParams.get('next')
  const switchPath = isLogin ? '/register' : '/login'
  const switchSearch = nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''
  const invalid = (field: FieldName) => Boolean(error && errorField === field)
  const describedBy = (field: FieldName, hintId?: string) =>
    [invalid(field) ? 'auth-error' : null, hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className="container-mf flex min-h-[calc(100dvh-4rem)] items-center py-8 sm:py-10">
      <div className="border-line bg-surface grid w-full overflow-hidden rounded-2xl border sm:rounded-3xl lg:grid-cols-2">
        <div className="relative hidden min-h-[34rem] overflow-hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
            alt=""
            className="size-full object-cover"
          />
          <div className="from-base via-base/70 to-base/20 absolute inset-0 bg-gradient-to-t" />
          <div className="absolute inset-0 flex flex-col justify-between p-10">
            <Link to="/" className="font-display text-2xl font-bold">
              MODO<span className="text-accent">FRIKI</span>
            </Link>
            <div>
              <div className="border-accent/30 bg-accent/10 text-accent mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold">
                <Sparkles className="size-3.5" /> Tu próxima historia empieza aquí
              </div>
              <p className="font-display max-w-md text-4xl leading-tight font-bold">
                Cómics, manhwas y novelas sin salir de tu biblioteca.
              </p>
              <p className="text-secondary mt-3 max-w-md text-sm leading-relaxed">
                Guarda favoritos, continúa donde lo dejaste y descubre nuevas series cada
                semana.
              </p>
              <div className="text-muted mt-6 flex items-center gap-2 text-xs">
                <ShieldCheck className="text-success size-4" />
                Tu sesión dura 7 días en este dispositivo.
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-5 sm:p-10 lg:p-12">
          <h1 className="sr-only">{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
          <div className="mb-7">
            <p className="text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase">
              {isLogin ? 'Bienvenido de vuelta' : 'Únete a la comunidad'}
            </p>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
            </h2>
            <p className="text-secondary mt-2 text-sm">
              {isLogin
                ? 'Continúa con tu biblioteca y tus lecturas guardadas.'
                : 'Es gratis, tarda menos de un minuto y no necesitas tarjeta.'}
            </p>
          </div>

          <form onSubmit={submit} noValidate className="space-y-4">
            {!isLogin ? (
              <div>
                <label
                  htmlFor="auth-name"
                  className="text-secondary mb-1.5 block text-xs font-semibold"
                >
                  Usuario
                </label>
                <div className="relative">
                  <User
                    aria-hidden="true"
                    className="text-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                  />
                  <input
                    id="auth-name"
                    ref={nameRef}
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value)
                      clearError()
                    }}
                    autoComplete="username"
                    maxLength={32}
                    required
                    aria-invalid={invalid('name')}
                    aria-describedby={describedBy('name')}
                    placeholder="Tu usuario friki"
                    className={cn(inputBase, 'pr-3 pl-10', invalid('name') && 'border-danger/60')}
                  />
                </div>
              </div>
            ) : null}

            <div>
              <label
                htmlFor="auth-email"
                className="text-secondary mb-1.5 block text-xs font-semibold"
              >
                Correo
              </label>
              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="text-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                />
                <input
                  id="auth-email"
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    clearError()
                  }}
                  autoComplete="email"
                  required
                  aria-invalid={invalid('email')}
                  aria-describedby={describedBy('email')}
                  placeholder="tu@correo.com"
                  className={cn(inputBase, 'pr-3 pl-10', invalid('email') && 'border-danger/60')}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="text-secondary mb-1.5 block text-xs font-semibold"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    clearError()
                  }}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder={isLogin ? 'Tu contraseña' : 'Mínimo 8 caracteres'}
                  maxLength={72}
                  required
                  aria-invalid={invalid('password')}
                  aria-describedby={describedBy(
                    'password',
                    isLogin ? undefined : 'auth-password-hint',
                  )}
                  className={cn(
                    inputBase,
                    'pr-11 pl-3.5',
                    invalid('password') && 'border-danger/60',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-controls="auth-password"
                  aria-pressed={showPassword}
                  className="text-muted hover:bg-raised hover:text-primary focus-visible:outline-accent absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                </button>
              </div>
              {!isLogin ? (
                <p id="auth-password-hint" className="text-muted mt-1.5 text-xs">
                  Al menos 8 caracteres.
                </p>
              ) : null}
            </div>

            {error ? (
              <p
                ref={errorRef}
                id="auth-error"
                role="alert"
                tabIndex={-1}
                className="border-danger/30 bg-danger/10 text-danger rounded-lg border px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
              >
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting}
              aria-busy={submitting}
            >
              {isLogin ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
              {isLogin ? 'Entrar' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="text-secondary mt-6 text-center text-sm">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <Link
              to={{ pathname: switchPath, search: switchSearch }}
              className={cn('text-accent font-semibold hover:underline')}
            >
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
