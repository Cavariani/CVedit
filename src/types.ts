export type Id = string
export type Lang = 'pt' | 'en'

export interface Bullet {
  id: Id
  text: string
  hidden?: boolean
}

export interface Group {
  id: Id
  title: string
  bullets: Bullet[]
}

export interface Entry {
  id: Id
  hidden?: boolean
  title: string
  org: string
  period: string
  location: string
  groups: Group[]
}

export interface Contact {
  id: Id
  label: string
  url: string
  hidden?: boolean
}

export interface SkillRow {
  id: Id
  label: string
  text: string
  hidden?: boolean
}

export interface ListItem {
  id: Id
  text: string
  hidden?: boolean
}

interface SectionBase {
  id: Id
  title: string
  hidden?: boolean
}

export type SummarySection = SectionBase & { kind: 'summary'; text: string }
export type SkillsSection = SectionBase & { kind: 'skills'; rows: SkillRow[] }
export type EntriesSection = SectionBase & { kind: 'entries'; entries: Entry[] }
export type ListSection = SectionBase & { kind: 'list'; items: ListItem[] }

export type Section = SummarySection | SkillsSection | EntriesSection | ListSection

export interface Variable {
  id: Id
  key: string
  value: string
}

export interface CV {
  name: string
  headline: string
  contacts: Contact[]
  sections: Section[]
  vars: Variable[]
}

export type TemplateKey = 'classic' | 'modern' | 'compact'
export type FontKey = 'inter' | 'plex' | 'source' | 'dm'
export type Density = 'compact' | 'normal' | 'airy'

export interface Settings {
  template: TemplateKey
  accent: string
  font: FontKey
  density: Density
  size: number
  margin: number
}

export interface Version {
  id: Id
  name: string
  lang: Lang
  cv: CV
  settings: Settings
  updatedAt: number
}

export interface Snapshot {
  id: Id
  at: number
  label: string
  version: Version
}

export interface AppState {
  versions: Version[]
  activeId: Id
  snapshots: Snapshot[]
}
