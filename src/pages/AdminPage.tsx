import { useSearchParams } from 'react-router-dom'
import { BookOpen, Flag, Shapes, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { WorksTab } from '@/components/admin/WorksTab'
import { TaxonomyTab } from '@/components/admin/TaxonomyTab'
import { ReportsTab } from '@/components/admin/ReportsTab'

const TABS = [
  { value: 'works', label: 'Obras', icon: BookOpen, adminOnly: false },
  { value: 'taxonomy', label: 'Taxonomía', icon: Shapes, adminOnly: true },
  { value: 'reports', label: 'Reportes', icon: Flag, adminOnly: true },
] as const

export function AdminPage() {
  useDocumentTitle('Panel')
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const isAdmin = user?.role === 'ADMIN'
  const tabs = TABS.filter((tab) => isAdmin || !tab.adminOnly)
  const active = tabs.find((tab) => tab.value === params.get('tab'))?.value ?? 'works'

  return (
    <div className="container-mf pt-8 pb-4">
      <div className="mb-6">
        <p className="text-accent mb-2 flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] uppercase">
          <ShieldCheck className="size-3.5" /> {isAdmin ? 'Administración' : 'Editor'}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Panel
        </h1>
      </div>

      <div
        role="tablist"
        aria-label="Secciones del panel"
        className="border-line mb-6 flex gap-1 border-b"
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active === tab.value}
            onClick={() => setParams({ tab: tab.value })}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors',
              active === tab.value
                ? 'border-accent text-accent'
                : 'text-secondary hover:text-primary border-transparent',
            )}
          >
            <tab.icon className="size-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {active === 'works' ? <WorksTab /> : null}
        {active === 'taxonomy' ? <TaxonomyTab /> : null}
        {active === 'reports' ? <ReportsTab /> : null}
      </div>
    </div>
  )
}
