import type { CV, Lang } from './types'

export const uid = () => Math.random().toString(36).slice(2, 9)

export function download(filename: string, text: string, mime = 'application/json') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function slug(s: string) {
  return (
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'CV'
  )
}

export function isoDay(ts = Date.now()) {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function daysSince(ts: number) {
  return Math.floor((Date.now() - ts) / 86_400_000)
}

export function agoLabel(ts: number) {
  const d = daysSince(ts)
  if (d <= 0) return 'hoje'
  if (d === 1) return 'ontem'
  return `há ${d} dias`
}

export function fmtDateTime(ts: number) {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Replace {{key}} tokens with the values from the CV variables. */
export function applyVars(text: string, vars: CV['vars']) {
  if (!text.includes('{{')) return text
  const map = new Map(vars.map((v) => [v.key.trim(), v.value]))
  return text.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (m, k: string) => map.get(k) ?? m)
}

/** Collect the variable keys referenced anywhere in the CV but not defined. */
export function missingVars(cv: CV) {
  const defined = new Set(cv.vars.map((v) => v.key.trim()))
  const used = new Set<string>()
  const scan = (s: string) => {
    for (const m of s.matchAll(/\{\{\s*([\w-]+)\s*\}\}/g)) used.add(m[1])
  }
  scan(cv.headline)
  cv.contacts.forEach((c) => scan(c.label))
  for (const s of cv.sections) {
    if (s.kind === 'summary') scan(s.text)
    if (s.kind === 'skills') s.rows.forEach((r) => scan(r.text))
    if (s.kind === 'list') s.items.forEach((i) => scan(i.text))
    if (s.kind === 'entries')
      s.entries.forEach((e) => e.groups.forEach((g) => g.bullets.forEach((b) => scan(b.text))))
  }
  return [...used].filter((k) => !defined.has(k))
}

export const LABELS: Record<
  Lang,
  { summary: string; skills: string; experience: string; list: string; newItem: string; newBullet: string }
> = {
  pt: {
    summary: 'Resumo',
    skills: 'Habilidades Técnicas',
    experience: 'Experiência Profissional',
    list: 'Cursos e Idiomas',
    newItem: 'Novo item',
    newBullet: '',
  },
  en: {
    summary: 'Summary',
    skills: 'Technical Skills',
    experience: 'Professional Experience',
    list: 'Courses & Languages',
    newItem: 'New item',
    newBullet: '',
  },
}
