import { useCallback, useEffect, useRef, useState } from 'react'
import { Editor } from './Editor'
import { FONTS, Preview } from './Preview'
import { parseBackup, useApp } from './store'
import type { CV, Density, FontKey, Settings, TemplateKey } from './types'
import { Dropdown, Icon, IconBtn, Modal } from './ui'
import { agoLabel, daysSince, download, fmtDateTime, isoDay, slug } from './utils'

const TEMPLATES: { key: TemplateKey; label: string }[] = [
  { key: 'classic', label: 'Clássico' },
  { key: 'modern', label: 'Moderno' },
  { key: 'compact', label: 'Compacto' },
]

const DENSITIES: { key: Density; label: string }[] = [
  { key: 'compact', label: 'Justo' },
  { key: 'normal', label: 'Normal' },
  { key: 'airy', label: 'Arejado' },
]

const SWATCHES = ['#1f4e79', '#0f766e', '#6d28d9', '#b91c1c', '#c2410c', '#334155', '#111827']

export default function App() {
  const app = useApp()
  const { active } = app
  const [pages, setPages] = useState(1)
  const [pane, setPane] = useState<'edit' | 'preview'>('edit')
  const [toast, setToast] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<number>(0)

  const notify = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3500)
  }, [])

  const mut = useCallback((fn: (cv: CV) => void) => app.edit((v) => fn(v.cv)), [app.edit])
  const setSetting = <K extends keyof Settings>(k: K, val: Settings[K]) =>
    app.edit((v) => void (v.settings[k] = val), false)

  useEffect(() => {
    document.documentElement.lang = active.lang === 'en' ? 'en' : 'pt-BR'
  }, [active.lang])

  /* ---- PDF: browser print engine, vector text, selectable and ATS friendly ---- */
  const exportPdf = () => {
    app.snapshotActive('Exportado em PDF')
    const prev = document.title
    const stamp = isoDay().slice(0, 7)
    document.title = `${slug(active.cv.name)}_CV_${active.lang.toUpperCase()}_${stamp}`
    const restore = () => {
      document.title = prev
      window.removeEventListener('afterprint', restore)
    }
    window.addEventListener('afterprint', restore)
    // let React flush the snapshot before the print dialog blocks the thread
    setTimeout(() => window.print(), 60)
  }

  /* ---- backup ---- */
  const exportJson = () => {
    download(`cv-studio-backup-${isoDay()}.json`, JSON.stringify({ app: 'cv-studio', format: 1, versions: app.state.versions }, null, 2))
    notify('Backup salvo com todas as versões')
  }

  const onImport = async (file: File | undefined) => {
    if (!file) return
    try {
      const versions = parseBackup(await file.text())
      app.importVersions(versions)
      notify(`${versions.length} versão(ões) importada(s). As substituídas foram para o histórico.`)
    } catch (e) {
      notify('Não consegui importar: ' + (e instanceof Error ? e.message : 'arquivo inválido'))
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const stale = daysSince(active.updatedAt) > 45

  return (
    <div className="app" data-pane={pane}>
      <div className="topbar no-print">
        <div className="brand">
          <span className="logo" />
          CV Studio
        </div>

        <div className="tabs" role="tablist">
          {app.state.versions.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={v.id === active.id}
              className={'tab' + (v.id === active.id ? ' on' : '')}
              onClick={() => app.setActive(v.id)}
            >
              <span className="lang">{v.lang.toUpperCase()}</span>
              {v.name}
            </button>
          ))}
          <Dropdown
            trigger={() => <IconBtn icon="plus" title="Nova versão" />}
            children={(close) => (
              <>
                <button
                  onClick={() => {
                    close()
                    const name = prompt('Nome da nova versão (cópia desta, em inglês):', active.name.replace(/\(.*\)/, '').trim() + ' (EN)')
                    if (name) app.addVersion('duplicate', 'en', name)
                  }}
                >
                  Duplicar esta como EN
                </button>
                <button
                  onClick={() => {
                    close()
                    const name = prompt('Nome da nova versão (cópia desta, em português):', active.name.replace(/\(.*\)/, '').trim() + ' (PT)')
                    if (name) app.addVersion('duplicate', 'pt', name)
                  }}
                >
                  Duplicar esta como PT
                </button>
                <hr />
                <button
                  onClick={() => {
                    close()
                    const name = prompt('Nome da versão em branco (PT):', 'Nova versão')
                    if (name) app.addVersion('blank', 'pt', name)
                  }}
                >
                  Em branco (PT)
                </button>
                <button
                  onClick={() => {
                    close()
                    const name = prompt('Nome da versão em branco (EN):', 'New version')
                    if (name) app.addVersion('blank', 'en', name)
                  }}
                >
                  Em branco (EN)
                </button>
              </>
            )}
          />
          <Dropdown
            trigger={() => <IconBtn icon="more" title="Opções da versão" />}
            children={(close) => (
              <>
                <button
                  onClick={() => {
                    close()
                    const name = prompt('Novo nome da versão:', active.name)
                    if (name) app.edit((v) => void (v.name = name), false)
                  }}
                >
                  Renomear
                </button>
                <button
                  onClick={() => {
                    close()
                    app.edit((v) => void (v.lang = v.lang === 'pt' ? 'en' : 'pt'), false)
                  }}
                >
                  Trocar idioma para {active.lang === 'pt' ? 'EN' : 'PT'}
                </button>
                <hr />
                <button
                  className="danger"
                  disabled={app.state.versions.length <= 1}
                  onClick={() => {
                    close()
                    if (confirm(`Excluir a versão "${active.name}"? Uma cópia fica no histórico.`)) app.deleteActive()
                  }}
                >
                  Excluir versão
                </button>
              </>
            )}
          />
        </div>

        <div className={'freshness' + (stale ? ' stale' : '')} title="Quando você editou o conteúdo pela última vez">
          Editado {agoLabel(active.updatedAt)}
          {stale && ' · hora de revisar'}
        </div>

        <div className="actions">
          <button className="btn" onClick={() => fileRef.current?.click()} title="Importar backup .json">
            <Icon name="upload" size={15} /> Importar
          </button>
          <button className="btn" onClick={exportJson} title="Salvar backup .json de todas as versões">
            <Icon name="download" size={15} /> Backup
          </button>
          <button className="btn" onClick={() => setHistoryOpen(true)} title="Histórico de versões salvas">
            <Icon name="history" size={15} /> Histórico
          </button>
          <button className="btn primary" onClick={exportPdf}>
            <Icon name="printer" size={15} /> Exportar PDF
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => onImport(e.target.files?.[0])} />
        </div>
      </div>

      <div className="designbar no-print">
        <div className="seg" role="group" aria-label="Template">
          {TEMPLATES.map((t) => (
            <button key={t.key} className={active.settings.template === t.key ? 'on' : ''} onClick={() => setSetting('template', t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="swatches" role="group" aria-label="Cor de destaque">
          {SWATCHES.map((c) => (
            <button
              key={c}
              className={'swatch' + (active.settings.accent.toLowerCase() === c ? ' on' : '')}
              style={{ background: c }}
              title={c}
              aria-label={`Cor ${c}`}
              onClick={() => setSetting('accent', c)}
            />
          ))}
          <label className="swatch custom" title="Outra cor">
            <input type="color" value={active.settings.accent} onChange={(e) => setSetting('accent', e.target.value)} />
          </label>
        </div>

        <select
          value={active.settings.font}
          onChange={(e) => setSetting('font', e.target.value as FontKey)}
          aria-label="Fonte"
          style={{ fontFamily: FONTS[active.settings.font].stack }}
        >
          {(Object.keys(FONTS) as FontKey[]).map((k) => (
            <option key={k} value={k}>
              {FONTS[k].label}
            </option>
          ))}
        </select>

        <div className="seg" role="group" aria-label="Espaçamento">
          {DENSITIES.map((d) => (
            <button key={d.key} className={active.settings.density === d.key ? 'on' : ''} onClick={() => setSetting('density', d.key)}>
              {d.label}
            </button>
          ))}
        </div>

        <label className="range" title="Tamanho do texto">
          Aa
          <input
            type="range"
            min={9}
            max={11.5}
            step={0.5}
            value={active.settings.size}
            onChange={(e) => setSetting('size', Number(e.target.value))}
          />
        </label>
        <label className="range" title="Margem da página">
          Margem
          <input
            type="range"
            min={8}
            max={20}
            step={1}
            value={active.settings.margin}
            onChange={(e) => setSetting('margin', Number(e.target.value))}
          />
        </label>

        <div className={'pages' + (pages > 3 ? ' warn' : '')} title="Contagem aproximada, a conferência final é no diálogo de impressão">
          ~{pages} {pages === 1 ? 'página' : 'páginas'}
        </div>

        <div className="mobile-switch">
          <button className={pane === 'edit' ? 'on' : ''} onClick={() => setPane('edit')}>
            Editar
          </button>
          <button className={pane === 'preview' ? 'on' : ''} onClick={() => setPane('preview')}>
            Preview
          </button>
        </div>
      </div>

      <div className="main">
        <div className="editor no-print">
          <Editor v={active} mut={mut} />
        </div>
        <Preview v={active} onPages={setPages} />
      </div>

      {toast && <div className="toast no-print">{toast}</div>}

      {historyOpen && (
        <Modal title="Histórico" onClose={() => setHistoryOpen(false)}>
          <p className="hint">
            Cada exportação para PDF guarda uma cópia aqui, e o app também guarda antes de importar, restaurar ou excluir.
            Restaurar volta a versão para aquele estado (o estado atual vira uma cópia no histórico).
          </p>
          <div className="row-actions">
            <button
              className="btn"
              onClick={() => {
                app.snapshotActive('Salvo manualmente')
                notify('Cópia salva no histórico')
              }}
            >
              Salvar cópia desta versão agora
            </button>
          </div>
          {app.state.snapshots.length === 0 ? (
            <p className="empty">Nenhuma cópia ainda. Elas aparecem aqui quando você exporta um PDF.</p>
          ) : (
            <ul className="snaps">
              {app.state.snapshots.map((s) => (
                <li key={s.id}>
                  <div>
                    <strong>
                      <span className="lang">{s.version.lang.toUpperCase()}</span> {s.version.name}
                    </strong>
                    <div className="meta">
                      {fmtDateTime(s.at)} · {s.label}
                    </div>
                  </div>
                  <div className="snap-actions">
                    <button
                      className="btn small"
                      onClick={() => {
                        if (confirm('Restaurar esta cópia? O estado atual dessa versão vai para o histórico.')) {
                          app.restoreSnapshot(s.id)
                          setHistoryOpen(false)
                          notify('Cópia restaurada')
                        }
                      }}
                    >
                      Restaurar
                    </button>
                    <IconBtn icon="trash" title="Excluir cópia" danger onClick={() => app.deleteSnapshot(s.id)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </div>
  )
}
