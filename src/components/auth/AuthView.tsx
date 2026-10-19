import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { DEMO_USERS } from '@/data/mock'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

const loginSchema = z.object({
  email: z.email('Escribe un correo válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
})

const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Escribe tu nombre.'),
})

export function AuthView({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState(mode === 'login' ? DEMO_USERS[0].email : '')
  const [password, setPassword] = useState(mode === 'login' ? 'modofriki' : '')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const isLogin = mode === 'login'

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError('')

    const result = isLogin
      ? loginSchema.safeParse({ email, password })
      : registerSchema.safeParse({ name, email, password })

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Revisa los datos.')
      return
    }

    const authResult = isLogin ? login(email, password) : register(name, email, password)
    if (!authResult.ok) {
      setError(authResult.error ?? 'No pudimos iniciar sesión.')
      return
    }

    toast.success(isLogin ? 'Bienvenido de vuelta' : 'Cuenta creada')
    navigate('/')
  }

  return (
    <div className="container-mf flex min-h-[calc(100vh-4rem)] items-center py-10">
      <div className="grid w-full overflow-hidden rounded-3xl border border-line bg-surface lg:grid-cols-2">
        <div className="relative hidden min-h-[34rem] overflow-hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
            alt=""
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-base via-base/70 to-base/20" />
          <div className="absolute inset-0 flex flex-col justify-between p-10">
            <Link to="/" className="font-display text-2xl font-bold">
              MODO<span className="text-accent">FRIKI</span>
            </Link>
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
                <Sparkles className="size-3.5" /> Tu próxima historia empieza aquí
              </div>
              <h1 className="max-w-md font-display text-4xl leading-tight font-bold">
                Cómics, manhwas y novelas sin salir de tu biblioteca.
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-secondary">
                Guarda favoritos, continúa donde lo dejaste y descubre nuevas series cada
                semana.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-muted">
                <ShieldCheck className="size-4 text-success" />
                Cuenta de demostración. No se envían datos reales.
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <div className="mb-7">
            <p className="mb-2 text-xs font-bold tracking-[0.2em] text-accent uppercase">
              {isLogin ? 'Bienvenido de vuelta' : 'Únete a la comunidad'}
            </p>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
            </h2>
            <p className="mt-2 text-sm text-secondary">
              {isLogin
                ? 'Continúa con tu biblioteca y tus lecturas guardadas.'
                : 'Es gratis, tarda menos de un minuto y no necesitas tarjeta.'}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {!isLogin ? (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-secondary">
                  Nombre
                </span>
                <span className="relative block">
                  <User className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    placeholder="Tu nombre friki"
                    className="h-11 w-full rounded-xl border border-line bg-base pr-3 pl-10 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent/60"
                  />
                </span>
              </label>
            ) : null}

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-secondary">
                Correo
              </span>
              <span className="relative block">
                <Mail className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  className="h-11 w-full rounded-xl border border-line bg-base pr-3 pl-10 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent/60"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-secondary">
                Contraseña
              </span>
              <span className="relative block">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder="Mínimo 6 caracteres"
                  className="h-11 w-full rounded-xl border border-line bg-base pr-11 pl-3.5 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-raised hover:text-primary"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>

            {error ? (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full">
              {isLogin ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
              {isLogin ? 'Entrar' : 'Crear cuenta'}
            </Button>
          </form>

          <div className="mt-5 rounded-xl border border-line bg-base/60 p-3">
            <p className="text-[11px] font-semibold text-secondary">Cuenta de prueba</p>
            <p className="mt-1 text-[11px] text-muted">
              {DEMO_USERS[0].email} · contraseña: <span className="text-accent">modofriki</span>
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-secondary">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <Link
              to={isLogin ? '/register' : '/login'}
              className={cn('font-semibold text-accent hover:underline')}
            >
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
