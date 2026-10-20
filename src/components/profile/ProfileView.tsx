import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogOut,
  Settings2,
  Flame,
  Trophy,
  UserRound,
} from 'lucide-react'
import {
  getReadingCalendar,
  getReadingStats,
  listReadingHistory,
  type HistoryEntry,
} from '@/services/reading'
import { useAsync } from '@/hooks/useAsync'
import { ErrorState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { ROLE_LABELS } from '@/lib/constants'
import type { ReadingMode } from '@/types'
import { cn } from '@/lib/cn'
import { formatChapterNumber, formatDate } from '@/lib/format'
import { useAuth } from '@/hooks/useAuth'
import { useLibrary } from '@/hooks/useLibrary'
import { useReaderSettings } from '@/hooks/useReaderSettings'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonStyles } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { CoverImage } from '@/components/ui/cover-image'
import { SectionHeader } from '@/components/ui/section-header'

export function ProfileView() {
  const { user, logout } = useAuth()
  const { getProgress } = useLibrary()
  const [historyPages, setHistoryPages] = useState(1)
  const stats = useAsync(getReadingStats, `reading-stats:${user?.id}`, Boolean(user))
  const calendar = useAsync(
    () => getReadingCalendar(),
    `calendar:${user?.id}`,
    Boolean(user),
  )
  const historyQuery = useAsync(
    async () => {
      const pages = await Promise.all(
        Array.from({ length: historyPages }, (_, index) =>
          listReadingHistory(index + 1, 20),
        ),
      )
      return { items: pages.flatMap((page) => page.items), total: pages[0]?.total ?? 0 }
    },
    `history:${user?.id}:${historyPages}`,
    Boolean(user),
  )
  const { settings, setMode } = useReaderSettings()

  if (!user) {
    return (
      <div className="container-mf pt-10">
        <EmptyState
          icon={UserRound}
          title="Inicia sesión para ver tu perfil"
          description="Guarda tus favoritos, continúa leyendo donde lo dejaste y personaliza tu experiencia."
          actionLabel="Iniciar sesión"
          actionTo="/login"
        />
      </div>
    )
  }

  const history: HistoryEntry[] =
    historyQuery.data?.items ?? historyQuery.staleData?.items ?? []
  const hasMoreHistory = history.length < (historyQuery.data?.total ?? 0)
  const maxDay = Math.max(
    1,
    ...(calendar.data?.days.map((day) => day.chaptersRead) ?? []),
  )

  return (
    <div className="container-mf pt-8 pb-4">
      <div className="border-line bg-surface relative overflow-hidden rounded-3xl border">
        <div className="from-accent/25 via-accent/10 h-28 bg-gradient-to-r to-transparent sm:h-40" />
        <div className="px-4 pb-5 sm:px-8 sm:pb-6">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end">
            <Avatar
              alt={user.username}
              size="xl"
              className="border-surface size-24 self-center border-4 sm:size-28 sm:self-auto"
            />
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">
                  {user.username}
                </h1>
                <Badge tone="accent">{ROLE_LABELS[user.role]}</Badge>
              </div>
              <p className="text-muted mt-1 text-sm">@{user.username}</p>
              <p className="text-muted mt-2 flex items-center gap-1.5 text-[11px]">
                <CalendarDays className="size-3.5" /> Miembro desde{' '}
                {formatDate(user.createdAt)}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={logout}
              className="w-full sm:mb-1 sm:w-auto"
            >
              <LogOut className="size-4" /> Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {stats.error ? (
        <ErrorState message={stats.error} onRetry={stats.reload} className="mt-6" />
      ) : null}
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {[
          {
            label: 'Racha actual',
            value: stats.data?.currentStreak,
            icon: Flame,
            suffix: ' días',
          },
          {
            label: 'Mejor racha',
            value: stats.data?.longestStreak,
            icon: Trophy,
            suffix: ' días',
          },
          {
            label: 'Capítulos leídos',
            value: stats.data?.markedReadChapters,
            icon: CheckCircle2,
          },
          { label: 'Favoritos', value: stats.data?.favorites, icon: BookOpen },
          { label: 'Lecturas (7 días)', value: stats.data?.readsLast7Days, icon: Clock3 },
          {
            label: 'Lecturas (30 días)',
            value: stats.data?.readsLast30Days,
            icon: Clock3,
          },
          { label: 'Días activos', value: stats.data?.activeDays, icon: CalendarDays },
          {
            label: 'Lecturas totales',
            value: stats.data?.recordedReads,
            icon: Settings2,
          },
        ].map((stat) => (
          <div key={stat.label} className="surface-card p-3.5 sm:p-4">
            <stat.icon className="text-accent size-4" />
            {stat.value === undefined ? (
              <Skeleton className="mt-2 h-8 w-12" />
            ) : (
              <p className="font-display mt-2 text-2xl font-bold">
                {stat.value}
                {'suffix' in stat && stat.suffix ? (
                  <span className="text-muted text-xs font-normal">{stat.suffix}</span>
                ) : null}
              </p>
            )}
            <p className="text-muted text-[11px]">{stat.label}</p>
          </div>
        ))}
      </div>

      <section className="surface-card mt-6 p-5">
        <h2 className="font-display flex items-center gap-2 text-base font-bold">
          <CalendarDays className="text-accent size-4" /> Calendario de lectura
        </h2>
        {calendar.error ? (
          <p className="text-danger mt-3 text-xs">{calendar.error}</p>
        ) : !calendar.data ? (
          <Skeleton className="mt-4 h-24 w-full" />
        ) : (
          <>
            <div className="mt-4 grid grid-flow-col grid-rows-7 justify-start gap-1 overflow-x-auto pb-1">
              {calendar.data.days.map((day) => (
                <span
                  key={day.date}
                  title={`${formatDate(day.date + 'T12:00:00')}: ${day.chaptersRead} capítulos`}
                  aria-label={`${day.date}: ${day.chaptersRead} capítulos`}
                  className="bg-raised size-3.5 rounded-[3px]"
                  style={
                    day.chaptersRead
                      ? {
                          backgroundColor: 'var(--color-accent)',
                          opacity: 0.3 + 0.7 * (day.chaptersRead / maxDay),
                        }
                      : undefined
                  }
                />
              ))}
            </div>
            <p className="text-muted mt-3 text-[11px]">
              Del {formatDate(calendar.data.from + 'T12:00:00')} al{' '}
              {formatDate(calendar.data.to + 'T12:00:00')} · zona horaria{' '}
              {calendar.data.timezone}
            </p>
          </>
        )}
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section>
          <SectionHeader
            title="Historial de lectura"
            description="Retoma cualquiera de tus lecturas recientes."
          />
          {historyQuery.error && history.length === 0 ? (
            <ErrorState message={historyQuery.error} onRetry={historyQuery.reload} />
          ) : historyQuery.loading && history.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Todavía no has leído nada"
              description="Abre cualquier capítulo y tu progreso aparecerá aquí automáticamente."
              actionLabel="Empezar a leer"
              actionTo="/series"
            />
          ) : (
            <div className="border-line bg-surface overflow-hidden rounded-2xl border">
              {history.map((item, index) => {
                const { series } = item
                const local = getProgress(series.id)
                const page = local?.chapterId === item.chapterId ? local : undefined
                return (
                  <Link
                    key={`${item.chapterId}-${item.lastReadAt}`}
                    to={`/read/${series.id}/${item.chapterId}`}
                    className={cn(
                      'group hover:bg-raised flex items-center gap-3 p-3 transition-colors sm:gap-4',
                      index !== history.length - 1 && 'border-line border-b',
                    )}
                  >
                    <CoverImage
                      src={series.coverUrl}
                      alt={`Portada de ${series.title}`}
                      title={series.title}
                      className="h-20 w-14 shrink-0 rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="group-hover:text-accent truncate text-sm font-semibold transition-colors">
                        {series.title}
                      </p>
                      <p className="text-muted mt-0.5 text-[11px]">
                        Cap. {formatChapterNumber(item.chapterNumber)}
                        {item.chapterTitle ? ` · ${item.chapterTitle}` : ''}
                        {page ? ` · Página ${page.page} de ${page.totalPages}` : ''}
                      </p>
                      <p className="text-muted mt-1 text-[11px]">
                        {formatDate(item.lastReadAt)}
                      </p>
                    </div>
                    {item.isRead ? (
                      <Badge tone="success" className="shrink-0">
                        Leído
                      </Badge>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          )}
          {hasMoreHistory ? (
            <Button
              variant="secondary"
              onClick={() => setHistoryPages((value) => value + 1)}
              disabled={historyQuery.loading}
              className="mt-3 w-full"
            >
              {historyQuery.loading ? 'Cargando…' : 'Cargar más'}
            </Button>
          ) : null}
        </section>

        <aside className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="font-display flex items-center gap-2 text-base font-bold">
              <Settings2 className="text-accent size-4" /> Preferencias
            </h2>
            <p className="text-muted mt-3 text-[11px] font-semibold tracking-wider uppercase">
              Modo de lectura
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['cascade', 'paginated'] as ReadingMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setMode(mode)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                    settings.mode === mode
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-line text-secondary hover:text-primary',
                  )}
                >
                  {mode === 'cascade' ? 'Cascada' : 'Paginado'}
                </button>
              ))}
            </div>
            <p className="text-muted mt-3 text-[11px]">
              El modo se guarda en este dispositivo y se aplica al lector.
            </p>
          </div>

          <div className="surface-card p-5">
            <h2 className="font-display text-base font-bold">Tu cuenta</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted shrink-0">Correo</dt>
                <dd className="min-w-0 truncate text-right font-medium">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Rol</dt>
                <dd className="font-medium">{ROLE_LABELS[user.role]}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Estado</dt>
                <dd className="text-success font-medium">Activo</dd>
              </div>
            </dl>
            <Button variant="danger" onClick={logout} className="mt-4 w-full">
              <LogOut className="size-4" /> Cerrar sesión
            </Button>
          </div>

          <Link
            to="/favorites"
            className={buttonStyles({ variant: 'secondary', className: 'w-full' })}
          >
            <BookOpen className="size-4" /> Ver favoritos
          </Link>
        </aside>
      </div>
    </div>
  )
}
