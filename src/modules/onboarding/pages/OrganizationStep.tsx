import React, { useEffect, useState, useRef } from 'react'
import OnboardingLayout from './OnboardingLayout'
import { useOrganizationMe, useUpdateOrganization } from '@/modules/organizations'

const COUNTRY_LABELS: Record<string, string> = {
  AO: 'Angola',
  MZ: 'Moçambique',
  PT: 'Portugal',
  BR: 'Brasil',
}

const COUNTRY_CODES: Record<string, string> = {
  Angola: 'AO',
  Moçambique: 'MZ',
  Portugal: 'PT',
  Brasil: 'BR',
}

function resolveCountryCode(country?: string | null): string {
  if (!country) return ''
  if (COUNTRY_CODES[country]) return COUNTRY_CODES[country]
  const entry = Object.entries(COUNTRY_LABELS).find(([, label]) => label === country)
  return entry?.[0] ?? country
}

export default function OrganizationStep() {
  const { data: org, isLoading } = useOrganizationMe()
  const updateOrg = useUpdateOrganization()

  const [form, setForm] = useState({
    name: '',
    country: '',
    city: '',
  })
  const [initialized, setInitialized] = useState(false)
  const [saving, setSaving] = useState(false)
  const saveTimeout = useRef<number | null>(null)

  useEffect(() => {
    if (!org || initialized) return
    setForm({
      name: org.name || '',
      country: resolveCountryCode(org.country),
      city: org.city || '',
    })
    setInitialized(true)
  }, [org, initialized])

  useEffect(() => {
    if (!initialized || !org) return
    if (!form.name.trim()) return

    if (saveTimeout.current) window.clearTimeout(saveTimeout.current)
    saveTimeout.current = window.setTimeout(async () => {
      setSaving(true)
      try {
        await updateOrg.mutateAsync({
          name: form.name.trim(),
          country: COUNTRY_LABELS[form.country] || form.country,
          city: form.city.trim() || undefined,
        })
      } catch (e) {
        console.error('Autosave failed', e)
      } finally {
        setSaving(false)
      }
    }, 800)

    return () => {
      if (saveTimeout.current) window.clearTimeout(saveTimeout.current)
    }
  }, [form, initialized, org, updateOrg])

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  if (isLoading) return <OnboardingLayout step={1}><div>Carregando...</div></OnboardingLayout>

  return (
    <OnboardingLayout step={1}>
      <div className="glass-card p-lg rounded-xl">
        <h2 className="font-title-md text-title-md text-primary mb-md">Informação da Organização</h2>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-md" onSubmit={e => e.preventDefault()}>
          <div className="md:col-span-4 flex flex-col gap-xs">
            <label className="font-label-sm text-on-surface-variant">Nome da Organização</label>
            <input name="name" value={form.name} onChange={onChange} className="form-inset-input rounded-lg px-md py-sm" />
          </div>

          <div className="md:col-span-4 mt-md">
            <label className="font-label-sm text-on-surface-variant">País</label>
            <select name="country" value={form.country} onChange={onChange} className="form-inset-input rounded-lg px-md py-sm w-full">
              <option value="">Selecionar país</option>
              <option value="AO">Angola</option>
              <option value="MZ">Moçambique</option>
              <option value="PT">Portugal</option>
              <option value="BR">Brasil</option>
            </select>
          </div>

          <div className="md:col-span-4 flex flex-col gap-xs mt-md">
            <label className="font-label-sm text-on-surface-variant">Cidade</label>
            <input name="city" value={form.city} onChange={onChange} className="form-inset-input rounded-lg px-md py-sm" />
          </div>

          <div className="md:col-span-4 mt-md flex justify-end items-center gap-sm">
            <span className="text-label-sm text-on-surface-variant">{saving ? 'A gravar...' : 'Guardado'}</span>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  )
}
