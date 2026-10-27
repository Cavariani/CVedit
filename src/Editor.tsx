import { useState } from 'react'
import type { ReactNode } from 'react'
import type { CV, EntriesSection, Entry, Group, ListSection, Section, SkillsSection, SummarySection, Version } from './types'
import { AutoTextarea, Grip, IconBtn, Icon, Reorder, focusNext } from './ui'
import type { Handle } from './ui'
import { LABELS, missingVars, uid } from './utils'

type Mut = (fn: (cv: CV) => void) => void

const sec = <T extends Section>(cv: CV, id: string) => cv.sections.find((s) => s.id === id) as T
const findEntry = (cv: CV, sid: string, eid: string) => sec<EntriesSection>(cv, sid).entries.find((e) => e.id === eid) as Entry
const findGroup = (cv: CV, sid: string, eid: string, gid: string) =>
  findEntry(cv, sid, eid).groups.find((g) => g.id === gid) as Group

function Collapsible({
  title,
  sub,
  open,
  onToggle,
  actions,
  handle,
  dim,
  children,
  className = '',
}: {
  title: ReactNode
  sub?: ReactNode
  open: boolean
  onToggle: () => void
  actions?: ReactNode
  handle?: Handle
  dim?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`card ${className} ${dim ? 'dim' : ''}`}>
      <div className="card-head">
        {handle && <Grip handle={handle} />}
        <button type="button" className="card-toggle" onClick={onToggle} aria-expanded={open}>
          <span className={'chev' + (open ? ' open' : '')}>
            <Icon name="chevron" size={14} />
          </span>
          <span className="card-title">{title}</span>
          {sub && <span className="card-sub">{sub}</span>}
        </button>
        <div className="card-actions">{actions}</div>
      </div>
      {open && <div className="card-body">{children}</div>}
    </div>
  )
}

/* ---------------- header (name, headline, contacts) ---------------- */

function HeaderCard({ v, mut }: { v: Version; mut: Mut }) {
  const [open, setOpen] = useState(true)
  const cv = v.cv
  return (
    <Collapsible title="Cabeçalho e contatos" open={open} onToggle={() => setOpen(!open)}>
      <label className="field">
        <span>Nome</span>
        <input value={cv.name} onChange={(e) => mut((c) => void (c.name = e.target.value))} />
      </label>
      <label className="field">
        <span>Título / headline</span>
        <input value={cv.headline} onChange={(e) => mut((c) => void (c.headline = e.target.value))} />
      </label>
      <div className="field-label">Contatos e links</div>
      <Reorder items={cv.contacts} onChange={(next) => mut((c) => void (c.contacts = next))} className="stack">
        {(ct, handle) => (
          <div className={'line' + (ct.hidden ? ' dim' : '')}>
            <Grip handle={handle} />
            <input
              placeholder="Texto exibido"
              value={ct.label}
              onChange={(e) => mut((c) => void (c.contacts.find((x) => x.id === ct.id)!.label = e.target.value))}
            />
            <input
              placeholder="Link (opcional)"
              value={ct.url}
              onChange={(e) => mut((c) => void (c.contacts.find((x) => x.id === ct.id)!.url = e.target.value))}
            />
            <IconBtn
              icon={ct.hidden ? 'eyeoff' : 'eye'}
              title={ct.hidden ? 'Mostrar no CV' : 'Ocultar do CV'}
              onClick={() => mut((c) => void (c.contacts.find((x) => x.id === ct.id)!.hidden = !ct.hidden))}
            />
            <IconBtn
              icon="trash"
              title="Remover"
              danger
              onClick={() => mut((c) => void (c.contacts = c.contacts.filter((x) => x.id !== ct.id)))}
            />
          </div>
        )}
      </Reorder>
      <button
        type="button"
        className="add"
        onClick={() => mut((c) => void c.contacts.push({ id: uid(), label: '', url: '' }))}
      >
        <Icon name="plus" size={14} /> Contato
      </button>
    </Collapsible>
  )
}

/* ---------------- variables ---------------- */

function VarsCard({ v, mut }: { v: Version; mut: Mut }) {
  const [open, setOpen] = useState(false)
  const cv = v.cv
  const missing = missingVars(cv)
  return (
    <Collapsible
      title="Números e métricas"
      sub={missing.length ? `${missing.length} sem valor` : `${cv.vars.length}`}
      open={open}
      onToggle={() => setOpen(!open)}
    >
      <p className="hint">
        Escreva <code>{'{{chave}}'}</code> em qualquer texto e o valor abaixo entra no lugar. Para atualizar um número
        em todo o CV, basta mudar aqui.
      </p>
      {missing.length > 0 && (
        <p className="warn">
          Usadas no texto e sem valor: {missing.map((k) => `{{${k}}}`).join(', ')}
        </p>
      )}
      <Reorder items={cv.vars} onChange={(next) => mut((c) => void (c.vars = next))} className="stack">
        {(vr, handle) => (
          <div className="line">
            <Grip handle={handle} />
            <input
              className="mono"
              placeholder="chave"
              value={vr.key}
              onChange={(e) =>
                mut((c) => void (c.vars.find((x) => x.id === vr.id)!.key = e.target.value.replace(/[^\w-]/g, '')))
              }
            />
            <input
              placeholder="valor"
              value={vr.value}
              onChange={(e) => mut((c) => void (c.vars.find((x) => x.id === vr.id)!.value = e.target.value))}
            />
            <IconBtn
              icon="trash"
              title="Remover"
              danger
              onClick={() => mut((c) => void (c.vars = c.vars.filter((x) => x.id !== vr.id)))}
            />
          </div>
        )}
      </Reorder>
      <button type="button" className="add" onClick={() => mut((c) => void c.vars.push({ id: uid(), key: '', value: '' }))}>
        <Icon name="plus" size={14} /> Número
      </button>
    </Collapsible>
  )
}

/* ---------------- section bodies ---------------- */

function SummaryBody({ s, mut }: { s: SummarySection; mut: Mut }) {
  return (
    <>
      <AutoTextarea
        value={s.text}
        onChange={(t) => mut((c) => void (sec<SummarySection>(c, s.id).text = t))}
        placeholder="Um parágrafo por linha. Use **negrito** para destacar."
      />
      <p className="hint">Cada linha vira um parágrafo.</p>
    </>
  )
}

function SkillsBody({ s, mut }: { s: SkillsSection; mut: Mut }) {
  const row = (c: CV, id: string) => sec<SkillsSection>(c, s.id).rows.find((r) => r.id === id)!
  return (
    <>
      <Reorder items={s.rows} onChange={(next) => mut((c) => void (sec<SkillsSection>(c, s.id).rows = next))} className="stack">
        {(r, handle) => (
          <div className={'line top' + (r.hidden ? ' dim' : '')}>
            <Grip handle={handle} />
            <div className="grow">
              <input
                className="strong"
                placeholder="Categoria"
                value={r.label}
                onChange={(e) => mut((c) => void (row(c, r.id).label = e.target.value))}
              />
              <AutoTextarea
                fid={r.id}
                value={r.text}
                placeholder="Tecnologias, separadas por vírgula"
                onChange={(t) => mut((c) => void (row(c, r.id).text = t))}
              />
            </div>
            <IconBtn
              icon={r.hidden ? 'eyeoff' : 'eye'}
              title={r.hidden ? 'Mostrar' : 'Ocultar'}
              onClick={() => mut((c) => void (row(c, r.id).hidden = !r.hidden))}
            />
            <IconBtn
              icon="trash"
              title="Remover"
              danger
              onClick={() => mut((c) => void (sec<SkillsSection>(c, s.id).rows = sec<SkillsSection>(c, s.id).rows.filter((x) => x.id !== r.id)))}
            />
          </div>
        )}
      </Reorder>
      <button
        type="button"
        className="add"
        onClick={() => {
          const id = uid()
          focusNext.id = id
          mut((c) => void sec<SkillsSection>(c, s.id).rows.push({ id, label: '', text: '' }))
        }}
      >
        <Icon name="plus" size={14} /> Categoria
      </button>
    </>
  )
}

function ListBody({ s, mut }: { s: ListSection; mut: Mut }) {
  const item = (c: CV, id: string) => sec<ListSection>(c, s.id).items.find((r) => r.id === id)!
  return (
    <>
      <Reorder items={s.items} onChange={(next) => mut((c) => void (sec<ListSection>(c, s.id).items = next))} className="stack">
        {(it, handle) => (
          <div className={'line top' + (it.hidden ? ' dim' : '')}>
            <Grip handle={handle} />
            <div className="grow">
              <AutoTextarea fid={it.id} value={it.text} onChange={(t) => mut((c) => void (item(c, it.id).text = t))} />
            </div>
            <IconBtn
              icon={it.hidden ? 'eyeoff' : 'eye'}
              title={it.hidden ? 'Mostrar' : 'Ocultar'}
              onClick={() => mut((c) => void (item(c, it.id).hidden = !it.hidden))}
            />
            <IconBtn
              icon="trash"
              title="Remover"
              danger
              onClick={() => mut((c) => void (sec<ListSection>(c, s.id).items = sec<ListSection>(c, s.id).items.filter((x) => x.id !== it.id)))}
            />
          </div>
        )}
      </Reorder>
      <button
        type="button"
        className="add"
        onClick={() => {
          const id = uid()
          focusNext.id = id
          mut((c) => void sec<ListSection>(c, s.id).items.push({ id, text: '' }))
        }}
      >
        <Icon name="plus" size={14} /> Item
      </button>
    </>
  )
}

function EntryCard({ sid, e, mut, handle }: { sid: string; e: Entry; mut: Mut; handle: Handle }) {
  const [open, setOpen] = useState(false)
  const set = (fn: (en: Entry) => void) => mut((c) => fn(findEntry(c, sid, e.id)))
  const total = e.groups.reduce((n, g) => n + g.bullets.length, 0)

  return (
    <Collapsible
      className="entry-card"
      handle={handle}
      dim={e.hidden}
      open={open}
      onToggle={() => setOpen(!open)}
      title={e.title || 'Sem título'}
      sub={e.org || `${total} itens`}
      actions={
        <>
          <IconBtn
            icon={e.hidden ? 'eyeoff' : 'eye'}
            title={e.hidden ? 'Mostrar no CV' : 'Ocultar do CV'}
            onClick={() => set((en) => void (en.hidden = !e.hidden))}
          />
          <IconBtn
            icon="trash"
            title="Remover"
            danger
            onClick={() => {
              if (confirm(`Remover "${e.title || 'este item'}"?`))
                mut((c) => void (sec<EntriesSection>(c, sid).entries = sec<EntriesSection>(c, sid).entries.filter((x) => x.id !== e.id)))
            }}
          />
        </>
      }
    >
      <div className="grid2">
        <label className="field">
          <span>Título / cargo</span>
          <input value={e.title} onChange={(ev) => set((en) => void (en.title = ev.target.value))} />
        </label>
        <label className="field">
          <span>Empresa / tecnologias</span>
          <input value={e.org} onChange={(ev) => set((en) => void (en.org = ev.target.value))} />
        </label>
        <label className="field">
          <span>Período</span>
          <input value={e.period} onChange={(ev) => set((en) => void (en.period = ev.target.value))} />
        </label>
        <label className="field">
          <span>Local</span>
          <input value={e.location} onChange={(ev) => set((en) => void (en.location = ev.target.value))} />
        </label>
      </div>

      <Reorder items={e.groups} onChange={(next) => set((en) => void (en.groups = next))} className="stack groups">
        {(gr, gh) => (
          <div className="group-box">
            <div className="line">
              <Grip handle={gh} />
              <input
                className="strong"
                placeholder="Subtítulo (opcional, ex.: nome de um projeto)"
                value={gr.title}
                onChange={(ev) => mut((c) => void (findGroup(c, sid, e.id, gr.id).title = ev.target.value))}
              />
              {e.groups.length > 1 && (
                <IconBtn
                  icon="trash"
                  title="Remover bloco"
                  danger
                  onClick={() => {
                    if (!gr.bullets.length || confirm('Remover este bloco e os itens dele?'))
                      set((en) => void (en.groups = en.groups.filter((x) => x.id !== gr.id)))
                  }}
                />
              )}
            </div>
            <Reorder
              items={gr.bullets}
              onChange={(next) => mut((c) => void (findGroup(c, sid, e.id, gr.id).bullets = next))}
              className="stack"
            >
              {(bl, bh) => {
                const bullet = (c: CV) => findGroup(c, sid, e.id, gr.id).bullets.find((x) => x.id === bl.id)!
                return (
                  <div className={'line top' + (bl.hidden ? ' dim' : '')}>
                    <Grip handle={bh} />
                    <div className="grow">
                      <AutoTextarea fid={bl.id} value={bl.text} onChange={(t) => mut((c) => void (bullet(c).text = t))} />
                    </div>
                    <IconBtn
                      icon={bl.hidden ? 'eyeoff' : 'eye'}
                      title={bl.hidden ? 'Mostrar' : 'Ocultar'}
                      onClick={() => mut((c) => void (bullet(c).hidden = !bl.hidden))}
                    />
                    <IconBtn
                      icon="trash"
                      title="Remover"
                      danger
                      onClick={() =>
                        mut((c) => {
                          const grp = findGroup(c, sid, e.id, gr.id)
                          grp.bullets = grp.bullets.filter((x) => x.id !== bl.id)
                        })
                      }
                    />
                  </div>
                )
              }}
            </Reorder>
            <button
              type="button"
              className="add small"
              onClick={() => {
                const id = uid()
                focusNext.id = id
                mut((c) => void findGroup(c, sid, e.id, gr.id).bullets.push({ id, text: '' }))
              }}
            >
              <Icon name="plus" size={13} /> Item
            </button>
          </div>
        )}
      </Reorder>
      <button
        type="button"
        className="add small"
        onClick={() => set((en) => void en.groups.push({ id: uid(), title: '', bullets: [{ id: uid(), text: '' }] }))}
      >
        <Icon name="plus" size={13} /> Bloco com subtítulo
      </button>
    </Collapsible>
  )
}

function EntriesBody({ s, mut, lang }: { s: EntriesSection; mut: Mut; lang: Version['lang'] }) {
  return (
    <>
      <Reorder items={s.entries} onChange={(next) => mut((c) => void (sec<EntriesSection>(c, s.id).entries = next))} className="stack">
        {(en, handle) => <EntryCard sid={s.id} e={en} mut={mut} handle={handle} />}
      </Reorder>
      <button
        type="button"
        className="add"
        onClick={() =>
          mut((c) =>
            void sec<EntriesSection>(c, s.id).entries.unshift({
              id: uid(),
              title: LABELS[lang].newItem,
              org: '',
              period: '',
              location: '',
              groups: [{ id: uid(), title: '', bullets: [{ id: uid(), text: '' }] }],
            }),
          )
        }
      >
        <Icon name="plus" size={14} /> Adicionar no topo
      </button>
    </>
  )
}

function SectionCard({ s, mut, handle, lang }: { s: Section; mut: Mut; handle: Handle; lang: Version['lang'] }) {
  const [open, setOpen] = useState(false)
  const count =
    s.kind === 'entries' ? s.entries.length : s.kind === 'skills' ? s.rows.length : s.kind === 'list' ? s.items.length : ''
  return (
    <Collapsible
      className="section-card"
      handle={handle}
      dim={s.hidden}
      open={open}
      onToggle={() => setOpen(!open)}
      title={s.title || 'Seção'}
      sub={count !== '' ? String(count) : undefined}
      actions={
        <>
          <IconBtn
            icon={s.hidden ? 'eyeoff' : 'eye'}
            title={s.hidden ? 'Mostrar seção' : 'Ocultar seção'}
            onClick={() => mut((c) => void (sec(c, s.id).hidden = !s.hidden))}
          />
          <IconBtn
            icon="trash"
            title="Remover seção"
            danger
            onClick={() => {
              if (confirm(`Remover a seção "${s.title}" inteira?`)) mut((c) => void (c.sections = c.sections.filter((x) => x.id !== s.id)))
            }}
          />
        </>
      }
    >
      <label className="field">
        <span>Nome da seção</span>
        <input value={s.title} onChange={(e) => mut((c) => void (sec(c, s.id).title = e.target.value))} />
      </label>
      {s.kind === 'summary' && <SummaryBody s={s} mut={mut} />}
      {s.kind === 'skills' && <SkillsBody s={s} mut={mut} />}
      {s.kind === 'list' && <ListBody s={s} mut={mut} />}
      {s.kind === 'entries' && <EntriesBody s={s} mut={mut} lang={lang} />}
    </Collapsible>
  )
}

/* ---------------- editor root ---------------- */

export function Editor({ v, mut }: { v: Version; mut: Mut }) {
  const cv = v.cv
  const L = LABELS[v.lang]
  const add = (s: Section) => mut((c) => void c.sections.push(s))

  return (
    <div className="editor-inner">
      <HeaderCard v={v} mut={mut} />
      <VarsCard v={v} mut={mut} />

      <div className="field-label sections-label">Seções (arraste para reordenar)</div>
      <Reorder items={cv.sections} onChange={(next) => mut((c) => void (c.sections = next))} className="stack">
        {(s, handle) => <SectionCard s={s} mut={mut} handle={handle} lang={v.lang} />}
      </Reorder>

      <div className="add-section">
        <span>Nova seção:</span>
        <button type="button" onClick={() => add({ id: uid(), kind: 'summary', title: L.summary, text: '' })}>
          Texto
        </button>
        <button type="button" onClick={() => add({ id: uid(), kind: 'skills', title: L.skills, rows: [] })}>
          Habilidades
        </button>
        <button type="button" onClick={() => add({ id: uid(), kind: 'entries', title: L.experience, entries: [] })}>
          Experiência / Projetos / Formação
        </button>
        <button type="button" onClick={() => add({ id: uid(), kind: 'list', title: L.list, items: [] })}>
          Lista
        </button>
      </div>
    </div>
  )
}
