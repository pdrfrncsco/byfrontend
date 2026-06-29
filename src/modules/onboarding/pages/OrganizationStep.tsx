import React, { useEffect, useState, useRef } from 'react'
import OnboardingLayout from './OnboardingLayout'
import { useOrganizationMe, useUpdateOrganization } from '@/modules/organizations'

export default function OrganizationStep() {
  const { data: org, isLoading } = useOrganizationMe()
  const updateOrg = useUpdateOrganization()

  const [form, setForm] = useState({
    name: '',
    acronym: '',
    country: '',
    province: '',
    city: '',
  })

  const [saving, setSaving] = useState(false)
  const saveTimeout = useRef<number | null>(null)

  useEffect(() => {
    if (org) {
      setForm({
        name: (org as any).name || '',
        acronym: (org as any).short_name || '',
        country: (org as any).country || '',
        province: (org as any).province || (org as any).state || '',
        city: (org as any).city || '',
      })
    }
  }, [org])

  // Debounced autosave
  useEffect(() => {
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current)
    saveTimeout.current = window.setTimeout(async () => {
      // If no org loaded yet, skip
      if (!org) return
      setSaving(true)
      try {
        await updateOrg.mutateAsync({
          name: form.name,
          short_name: form.acronym,
          country: form.country,
          city: form.city,
          // province/state mapping handled server-side if needed
          province: form.province,
        } as any)
      } catch (e) {
        // swallow — UI can show toast in future
        console.error('Autosave failed', e)
      } finally {
        setSaving(false)
      }
    }, 800)

    return () => {
      if (saveTimeout.current) window.clearTimeout(saveTimeout.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  if (isLoading) return <OnboardingLayout step={1}><div>Carregando...</div></OnboardingLayout>

  return (
    <OnboardingLayout step={1}>
      <div className="glass-card p-lg rounded-xl">
        <h2 className="font-title-md text-title-md text-primary mb-md">Informação da Organização</h2>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-md">
          <div className="md:col-span-3 flex flex-col gap-xs">
            <label className="font-label-sm text-on-surface-variant">Nome da Organização</label>
            <input name="name" value={form.name} onChange={onChange} className="form-inset-input rounded-lg px-md py-sm" />
          </div>

          <div className="md:col-span-1 flex flex-col gap-xs">
            <label className="font-label-sm text-on-surface-variant">Sigla</label>
            <input name="acronym" value={form.acronym} onChange={onChange} className="form-inset-input rounded-lg px-md py-sm text-center uppercase" />
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

          <div className="md:col-span-2 flex flex-col gap-xs mt-md">
            <label className="font-label-sm text-on-surface-variant">Província</label>
            <input name="province" value={form.province} onChange={onChange} className="form-inset-input rounded-lg px-md py-sm" />
          </div>

          <div className="md:col-span-2 flex flex-col gap-xs mt-md">
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
