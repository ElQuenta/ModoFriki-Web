import { useContext } from 'react'
import { UIContext } from '@/context/UIContext'

export function useUI() {
  const context = useContext(UIContext)
  if (!context) throw new Error('useUI debe usarse dentro de UIProvider')
  return context
}
