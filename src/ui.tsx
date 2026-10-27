import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { DragEvent, ReactNode, TextareaHTMLAttributes } from 'react'

const PATHS: Record<string, ReactNode> = {
  grip: <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" strokeWidth="3" />,
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeoff: (
    <path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 7.6C3.9 9.4 2 12 2 12s3.5 6 10 6c1.5 0 2.8-.3 4-.8M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  ),
  trash: <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  download: <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />,
  upload: <path d="M12 15V3M7 8l5-5 5 5M4 21h16" />,
  history: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" />,
  printer: <path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z" />,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth="3" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
}

export function Icon({ name, size = 16 }: { name: keyof typeof PATHS; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  )
}

export function IconBtn({
  icon,
  title,
  onClick,
  active,
  danger,
}: {
  icon: keyof typeof PATHS
  title: string
  onClick?: () => void
  active?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      className={'ibtn' + (active ? ' on' : '') + (danger ? ' danger' : '')}
      title={title}
      aria-label={title}
      onClick={onClick}
    >
      <Icon name={icon} size={15} />
    </button>
  )
}

/* ---------- textarea that grows with its content ---------- */

export const focusNext = { id: null as string | null }

type AutoProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> & {
  value: string
  onChange: (v: string) => void
  fid?: string
}

export function AutoTextarea({ value, onChange, fid, ...rest }: AutoProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const fit = () => {
    const el = ref.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = el.scrollHeight + 2 + 'px'
  }

  useLayoutEffect(fit, [value])

  useEffect(() => {
    if (fid && focusNext.id === fid) {
      focusNext.id = null
      ref.current?.focus()
    }
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    let w = el.offsetWidth
    const ro = new ResizeObserver(() => {
      if (el.offsetWidth !== w) {
        w = el.offsetWidth
        fit()
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <textarea ref={ref} rows={1} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
}

/* ---------- drag and drop reordering (native HTML5, no dependency) ---------- */

export interface Handle {
  draggable: true
  onDragStart: (e: DragEvent<HTMLElement>) => void
  onDragEnd: () => void
}

export function Reorder<T extends { id: string }>({
  items,
  onChange,
  children,
  className,
}: {
  items: T[]
  onChange: (next: T[]) => void
  children: (item: T, handle: Handle, index: number) => ReactNode
  className?: string
}) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const drop = (targetId: string) => {
    if (!dragId || dragId === targetId) return
    const from = items.findIndex((i) => i.id === dragId)
    const to = items.findIndex((i) => i.id === targetId)
    if (from < 0 || to < 0) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  return (
    <div className={className}>
      {items.map((it, idx) => {
        const handle: Handle = {
          draggable: true,
          onDragStart: (e) => {
            e.stopPropagation()
            setDragId(it.id)
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', it.id)
            const row = (e.currentTarget as HTMLElement).closest('[data-row]') as HTMLElement | null
            if (row) e.dataTransfer.setDragImage(row, 12, 12)
          },
          onDragEnd: () => {
            setDragId(null)
            setOverId(null)
          },
        }
        const cls =
          'rw' + (dragId === it.id ? ' dragging' : '') + (dragId && overId === it.id && dragId !== it.id ? ' drop-target' : '')
        return (
          <div
            key={it.id}
            data-row
            className={cls}
            onDragOver={(e) => {
              if (!dragId) return
              e.preventDefault()
              e.stopPropagation()
              setOverId(it.id)
            }}
            onDrop={(e) => {
              if (!dragId) return
              e.preventDefault()
              e.stopPropagation()
              drop(it.id)
              setDragId(null)
              setOverId(null)
            }}
          >
            {children(it, handle, idx)}
          </div>
        )
      })}
    </div>
  )
}

export function Grip({ handle }: { handle: Handle }) {
  return (
    <span className="grip" title="Arraste para reordenar" {...handle}>
      <Icon name="grip" size={14} />
    </span>
  )
}

/* ---------- dropdown menu ---------- */

export function Dropdown({
  trigger,
  children,
  align = 'left',
}: {
  trigger: (open: boolean) => ReactNode
  children: (close: () => void) => ReactNode
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="dd" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger(open)}</div>
      {open && <div className={'dd-menu ' + align}>{children(() => setOpen(false))}</div>}
    </div>
  )
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="overlay no-print" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <IconBtn icon="close" title="Fechar" onClick={onClose} />
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
