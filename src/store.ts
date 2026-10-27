import { useCallback, useEffect, useState } from 'react'
import type { AppState, Lang, Snapshot, Version } from './types'
import { blankVersion, seedState } from './seed'
import { uid } from './utils'

const KEY = 'cv-studio:v1'
const MAX_SNAPSHOTS = 40

function valid(s: unknown): s is AppState {
  const a = s as AppState
  return (
    !!a &&
    Array.isArray(a.versions) &&
    a.versions.length > 0 &&
    a.versions.every((v) => v && v.cv && Array.isArray(v.cv.sections) && v.settings) &&
    typeof a.activeId === 'string'
  )
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (valid(parsed)) return { ...parsed, snapshots: parsed.snapshots ?? [] }
    }
  } catch {
    /* fall through to seed */
  }
  return seedState()
}

const sameContent = (a: Version, b: Version) =>
  JSON.stringify([a.cv, a.settings, a.name, a.lang]) === JSON.stringify([b.cv, b.settings, b.name, b.lang])

function withSnapshot(snaps: Snapshot[], label: string, v: Version): Snapshot[] {
  const last = snaps.find((s) => s.version.id === v.id)
  if (last && sameContent(last.version, v)) return snaps
  const snap: Snapshot = { id: uid(), at: Date.now(), label, version: structuredClone(v) }
  return [snap, ...snaps].slice(0, MAX_SNAPSHOTS)
}

export function useApp() {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(state))
      } catch {
        /* storage full or blocked: ignore */
      }
    }, 250)
    return () => clearTimeout(t)
  }, [state])

  const active = state.versions.find((v) => v.id === state.activeId) ?? state.versions[0]

  /** Edit the active version. `touch` false keeps the "last edited" date (design tweaks). */
  const edit = useCallback((fn: (v: Version) => void, touch = true) => {
    setState((s) => ({
      ...s,
      versions: s.versions.map((v) => {
        if (v.id !== s.activeId) return v
        const c = structuredClone(v)
        fn(c)
        if (touch) c.updatedAt = Date.now()
        return c
      }),
    }))
  }, [])

  const setActive = useCallback((id: string) => setState((s) => ({ ...s, activeId: id })), [])

  const addVersion = useCallback((kind: 'blank' | 'duplicate', lang: Lang, name: string) => {
    setState((s) => {
      const cur = s.versions.find((v) => v.id === s.activeId) ?? s.versions[0]
      const nv: Version =
        kind === 'blank'
          ? blankVersion(lang, name)
          : { ...structuredClone(cur), id: uid(), name, lang, updatedAt: Date.now() }
      return { ...s, versions: [...s.versions, nv], activeId: nv.id }
    })
  }, [])

  const deleteActive = useCallback(() => {
    setState((s) => {
      if (s.versions.length <= 1) return s
      const cur = s.versions.find((v) => v.id === s.activeId)
      const snaps = cur ? withSnapshot(s.snapshots, 'Antes de excluir a versão', cur) : s.snapshots
      const versions = s.versions.filter((v) => v.id !== s.activeId)
      return { ...s, versions, activeId: versions[0].id, snapshots: snaps }
    })
  }, [])

  const snapshotActive = useCallback((label: string) => {
    setState((s) => {
      const cur = s.versions.find((v) => v.id === s.activeId)
      if (!cur) return s
      return { ...s, snapshots: withSnapshot(s.snapshots, label, cur) }
    })
  }, [])

  const restoreSnapshot = useCallback((id: string) => {
    setState((s) => {
      const snap = s.snapshots.find((x) => x.id === id)
      if (!snap) return s
      const restored: Version = { ...structuredClone(snap.version), updatedAt: Date.now() }
      const existing = s.versions.find((v) => v.id === restored.id)
      const snaps = existing ? withSnapshot(s.snapshots, 'Antes de restaurar', existing) : s.snapshots
      const versions = existing
        ? s.versions.map((v) => (v.id === restored.id ? restored : v))
        : [...s.versions, restored]
      return { ...s, versions, activeId: restored.id, snapshots: snaps }
    })
  }, [])

  const deleteSnapshot = useCallback((id: string) => {
    setState((s) => ({ ...s, snapshots: s.snapshots.filter((x) => x.id !== id) }))
  }, [])

  /** Merge a backup: versions with a known id are replaced (after a snapshot), new ones are added. */
  const importVersions = useCallback((incoming: Version[]) => {
    setState((s) => {
      let snaps = s.snapshots
      let versions = [...s.versions]
      for (const raw of incoming) {
        const v = structuredClone(raw)
        const i = versions.findIndex((x) => x.id === v.id)
        if (i >= 0) {
          snaps = withSnapshot(snaps, 'Antes de importar', versions[i])
          versions[i] = v
        } else {
          versions = [...versions, v]
        }
      }
      return { ...s, versions, snapshots: snaps, activeId: incoming[0]?.id ?? s.activeId }
    })
  }, [])

  return {
    state,
    active,
    edit,
    setActive,
    addVersion,
    deleteActive,
    snapshotActive,
    restoreSnapshot,
    deleteSnapshot,
    importVersions,
  }
}

export function parseBackup(text: string): Version[] {
  const data = JSON.parse(text)
  const list: unknown[] = Array.isArray(data?.versions) ? data.versions : data?.version ? [data.version] : []
  const ok = list.filter(
    (v): v is Version => !!v && typeof v === 'object' && !!(v as Version).cv && Array.isArray((v as Version).cv.sections),
  )
  if (!ok.length) throw new Error('Arquivo sem versões de CV válidas')
  return ok.map((v) => ({
    ...v,
    id: v.id || uid(),
    name: v.name || 'Importado',
    lang: v.lang === 'en' ? 'en' : 'pt',
    updatedAt: v.updatedAt || Date.now(),
    settings: { ...seedState().versions[0].settings, ...v.settings },
  }))
}
