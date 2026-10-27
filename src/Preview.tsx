import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { Version } from './types'
import { applyVars } from './utils'

export const FONTS = {
  inter: { label: 'Inter', stack: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif" },
  plex: { label: 'IBM Plex Sans', stack: "'IBM Plex Sans', system-ui, 'Segoe UI', sans-serif" },
  source: { label: 'Source Serif 4', stack: "'Source Serif 4', Georgia, 'Times New Roman', serif" },
  dm: { label: 'DM Sans', stack: "'DM Sans', system-ui, 'Segoe UI', sans-serif" },
} as const

const MM = 96 / 25.4
const PAGE_W = 210 * MM
const PAGE_H = 297 * MM

/** **bold** inline markup. */
function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') && p.length > 4 ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>,
  )
}

export function CVSheet({ v }: { v: Version }) {
  const { cv } = v
  const t =(x: string) => inline(applyVars(x, cv.vars))
  const contacts = cv.contacts.filter((c) => !c.hidden && c.label.trim())

  return (
    <>
      <header className="cv-head">
        <h1>{cv.name}</h1>
        {cv.headline.trim() && <div className="headline">{t(cv.headline)}</div>}
        {contacts.length > 0 && (
          <div className="contacts">
            {contacts.map((c) => (
              <span key={c.id}>
                {c.url.trim() ? (
                  <a href={c.url} target="_blank" rel="noreferrer">
                    {c.label}
                  </a>
                ) : (
                  c.label
                )}
              </span>
            ))}
          </div>
        )}
      </header>

      {cv.sections
        .filter((sec) => !sec.hidden)
        .map((sec) => (
          <section className="sec" key={sec.id}>
            <h2>{sec.title}</h2>

            {sec.kind === 'summary' &&
              sec.text
                .split('\n')
                .filter((l) => l.trim())
                .map((l, i) => (
                  <p className="summary" key={i}>
                    {t(l)}
                  </p>
                ))}

            {sec.kind === 'skills' && (
              <div className="skills">
                {sec.rows
                  .filter((r) => !r.hidden)
                  .map((r) => (
                    <div className="skill-row" key={r.id}>
                      <span className="skill-label">{r.label}</span>
                      <span className="skill-text">{t(r.text)}</span>
                    </div>
                  ))}
              </div>
            )}

            {sec.kind === 'list' && (
              <ul className="plain">
                {sec.items
                  .filter((i) => !i.hidden)
                  .map((i) => (
                    <li key={i.id}>{t(i.text)}</li>
                  ))}
              </ul>
            )}

            {sec.kind === 'entries' &&
              sec.entries
                .filter((e) => !e.hidden)
                .map((e) => {
                  const meta = [e.period, e.location].filter((x) => x.trim()).join(' · ')
                  return (
                    <div className="entry" key={e.id}>
                      <div className="entry-head">
                        <div className="entry-title">
                          <strong>{e.title}</strong>
                          {e.org.trim() && <span className="org">{e.org}</span>}
                        </div>
                        {meta && <div className="entry-meta">{meta}</div>}
                      </div>
                      {e.groups.map((gr) => {
                        const bullets = gr.bullets.filter((b) => !b.hidden && b.text.trim())
                        if (!bullets.length && !gr.title.trim()) return null
                        return (
                          <div className="group" key={gr.id}>
                            {gr.title.trim() && <div className="group-title">{gr.title}</div>}
                            {bullets.length > 0 && (
                              <ul>
                                {bullets.map((b) => (
                                  <li key={b.id}>{t(b.text)}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
          </section>
        ))}
    </>
  )
}

export function Preview({ v, onPages }: { v: Version; onPages: (n: number) => void }) {
  const paneRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLTableCellElement>(null)
  const [scale, setScale] = useState(1)
  const [bodyH, setBodyH] = useState(0)
  const [cvH, setCvH] = useState(PAGE_H)
  const cvRef = useRef<HTMLDivElement>(null)
  const s = v.settings

  useLayoutEffect(() => {
    const pane = paneRef.current
    if (!pane) return
    const fit = () => setScale(Math.min(1.25, Math.max(0.3, (pane.clientWidth - 40) / PAGE_W)))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(pane)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    const body = bodyRef.current
    const cv = cvRef.current
    if (!body || !cv) return
    const measure = () => {
      setBodyH(body.offsetHeight)
      setCvH(cv.offsetHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(body)
    ro.observe(cv)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [])

  const usable = PAGE_H - 2 * s.margin * MM
  const pages = Math.max(1, Math.ceil(bodyH / usable - 0.03))

  useEffect(() => onPages(pages), [pages, onPages])

  const style = {
    '--accent': s.accent,
    '--font': FONTS[s.font].stack,
    '--base': s.size + 'pt',
    '--margin': s.margin + 'mm',
  } as CSSProperties

  const breaks = Array.from({ length: pages - 1 }, (_, i) => s.margin * MM + (i + 1) * usable)

  return (
    <div className="preview-pane" ref={paneRef}>
      <div className="scale-box" style={{ width: PAGE_W * scale, height: cvH * scale }}>
        <div className="scale-inner" style={{ transform: `scale(${scale})`, width: PAGE_W }}>
          <div ref={cvRef} className={`cv t-${s.template} d-${s.density}`} style={style} lang={v.lang}>
            <table className="sheet">
              <thead>
                <tr>
                  <td>
                    <div className="spacer" />
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="body" ref={bodyRef}>
                    <CVSheet v={v} />
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>
                    <div className="spacer" />
                  </td>
                </tr>
              </tfoot>
            </table>
            {breaks.map((y, i) => (
              <div className="page-break no-print" key={i} style={{ top: y }}>
                <span>página {i + 2}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
