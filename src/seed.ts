import type { AppState, Bullet, CV, Entry, Group, Lang, Section, Settings, Version } from './types'
import { LABELS, uid } from './utils'

const b = (text: string): Bullet => ({ id: uid(), text })
const g = (title: string, bullets: string[]): Group => ({ id: uid(), title, bullets: bullets.map(b) })
const entry = (title: string, org: string, period: string, location: string, groups: Group[]): Entry => ({
  id: uid(),
  title,
  org,
  period,
  location,
  groups,
})

export const defaultSettings = (): Settings => ({
  template: 'classic',
  accent: '#1f4e79',
  font: 'inter',
  density: 'normal',
  size: 10,
  margin: 14,
})

export function blankCV(lang: Lang): CV {
  const L = LABELS[lang]
  return {
    name: 'Seu Nome',
    headline: '',
    contacts: [],
    vars: [],
    sections: [
      { id: uid(), kind: 'summary', title: L.summary, text: '' },
      { id: uid(), kind: 'entries', title: L.experience, entries: [] },
    ],
  }
}

export function blankVersion(lang: Lang, name: string): Version {
  return { id: uid(), name, lang, cv: blankCV(lang), settings: defaultSettings(), updatedAt: Date.now() }
}

const contacts = () => [
  { id: uid(), label: 'São Paulo, SP', url: '' },
  { id: uid(), label: '(17) 99629-6823', url: '' },
  { id: uid(), label: 'pedrorcavariani@hotmail.com', url: 'mailto:pedrorcavariani@hotmail.com' },
  { id: uid(), label: 'pedrorc.com', url: 'https://pedrorc.com' },
  { id: uid(), label: 'LinkedIn', url: '' },
  { id: uid(), label: 'github.com/Cavariani', url: 'https://github.com/Cavariani' },
]

const ptCV = (): CV => {
  const sections: Section[] = [
    {
      id: uid(),
      kind: 'summary',
      title: 'Resumo',
      text: [
        'Desenvolvedor Full Stack responsável pela arquitetura, desenvolvimento e manutenção de quatro sistemas corporativos em produção, além de um SaaS comercial entregue como freelance.',
        'Foco em substituir processos manuais e sistemas legados por aplicações web modernas, do banco de dados à interface, com integrações a APIs externas, arquitetura multi-tenant e requisitos de segurança e auditoria.',
        '**Stack:** React, Next.js, TypeScript, JavaScript, Vue.js, ASP.NET Core, C#, Java, APIs REST, SQL Server, PostgreSQL.',
        'Inglês C1 (TOEIC 920/990). Aberto a remoto.',
      ].join('\n'),
    },
    {
      id: uid(),
      kind: 'skills',
      title: 'Habilidades Técnicas',
      rows: [
        {
          id: uid(),
          label: 'Front-End',
          text: 'React 19, Next.js 16 (App Router, Server Components, Server Actions), TypeScript, JavaScript (ES6+), Vite, Tailwind CSS, HTML5, CSS3, Framer Motion, Recharts, AG Grid, Three.js / React Three Fiber, TanStack Query, Vue.js, Flutter',
        },
        {
          id: uid(),
          label: 'Back-End & APIs',
          text: 'ASP.NET Core 8, C# (.NET), Node.js, Fastify, REST APIs, Edge Functions (Deno), integração SOAP/XML, background workers, Python, Java',
        },
        {
          id: uid(),
          label: 'Bancos de Dados',
          text: 'SQL Server, PostgreSQL (Supabase, Neon), Entity Framework Core, Prisma, Drizzle ORM. Modelagem relacional, stored procedures, otimização de queries em alto volume, migrations versionadas, Row Level Security',
        },
        {
          id: uid(),
          label: 'Segurança',
          text: 'JWT, OAuth 2.0 / OpenID Connect (Microsoft Entra ID), MFA, AES-256-GCM, PBKDF2, BCrypt, scrypt, certificados digitais A1 (.pfx), RBAC, Content Security Policy, auditoria de vulnerabilidades',
        },
        {
          id: uid(),
          label: 'Design & Produto',
          text: 'Interfaces e design systems dos meus projetos desenhados do zero, sem biblioteca de componentes pronta: tokens de cor e tipografia, gramática de componentes, design responsivo',
        },
        {
          id: uid(),
          label: 'Infra & DevOps',
          text: 'IIS, Windows Server, Vercel, PowerShell, Git/GitHub, reverse proxy (URL Rewrite + ARR), Docker (formação), Agile/Scrum',
        },
        {
          id: uid(),
          label: 'IA & Agentes',
          text: 'Desenvolvimento assistido por agentes no dia a dia: fluxos agênticos e harnesses próprios, skills e plugins customizados para Claude Code, gerenciamento de contexto e documentação técnica em CLAUDE.md. IA embutida em produto com Anthropic Messages API e Groq API + LLaMA 3.3 70B, com few-shot e prompt caching',
        },
      ],
    },
    {
      id: uid(),
      kind: 'entries',
      title: 'Experiência Profissional',
      entries: [
        entry('Desenvolvedor Full Stack Junior', 'MLEGATE', 'Jun 2025 – Atual', 'São Paulo, SP', [
          g('', ['Quatro sistemas internos e de cliente sob minha responsabilidade técnica, do frontend ao banco e à infraestrutura.']),
          g('Plataforma REINF · SaaS fiscal em produção', [
            '{{eventos}} eventos fiscais transmitidos em {{lotes}} lotes desde abril de 2026, somando {{valor_fiscal}} em valores fiscais e {{retencoes}} em retenções.',
            'A taxa de aceite saiu de 47% no mês de lançamento para {{aceite}} nos últimos 60 dias, depois que reescrevi a transmissão como um serviço em background tolerante a falha de rede e a timeout da Receita. Desde então concluiu 74 dos 74 lotes planejados.',
            'Hoje praticamente todo envio REINF da empresa passa por ela. A ideia foi minha: identifiquei o gargalo, construí a primeira versão por conta própria e só depois apresentei à diretoria.',
            'O webservice da Receita é assíncrono, mal documentado, e devolve schemas que não constam no manual. Gero e assino os XMLs com certificado A1, faço o polling do retorno, trato os schemas fora do manual e traduzo os códigos de erro para algo que um contador entende. Nove tipos de evento.',
            'O que levava até 30 horas no WinForms antigo hoje leva minutos, com o desktop legado inteiro migrado para React 19, Vite e ASP.NET Core 8.',
            'Multi-tenant para {{empresas}} empresas e {{usuarios}} usuários, com certificados criptografados em repouso e acesso por role. Traz também o Rex, assistente de IA com contexto do sistema e dos manuais da Receita.',
            'Cada falha é registrada no banco com o motivo, não só com o código. Quando algo quebra em produção dá para reconstruir o que houve sem adivinhar, e foi assim que a taxa de erro caiu.',
          ]),
          g('Ferramenta BTC · Contas a receber para operadora de torres de telecom', [
            'A Brazil Tower Company mandava planilhas Excel desestruturadas, a contabilidade devolvia para correção, e o ciclo se repetia várias vezes por mês. Construí a aplicação que acabou com isso, onde provisão, faturamento e recebimento existem como entidades próprias.',
            'Grava direto no razão do ERP contábil legado, que não expõe API nenhuma. Reimplementei as garantias do lado de cá: transação tudo ou nada, débito conferido contra crédito antes do commit e período validado no calendário do legado.',
            'O usuário de aplicação roda sob DENY de UPDATE e DELETE no razão. Nem por bug o sistema reescreve histórico contábil, e correção só sai por estorno.',
            '{{endpoints}} endpoints REST, 19 entidades e {{testes}} testes de backend rodando contra o banco real. Em produção movimenta {{provisoes}} provisões e {{receita}} de receita provisionada em {{torres}} torres. React 19, TypeScript, AG Grid, Node.js com Fastify, Prisma sobre SQL Server, publicado em IIS.',
          ]),
          g('Painel TI · Plataforma interna de operações', [
            'Estoque de periféricos, credenciais, tarefas do time, monitoramento dos sistemas e base de conhecimento viviam em planilhas soltas e no WhatsApp. Juntei tudo em uma plataforma, da ideia ao ar em quatro dias.',
            'O cofre de senhas é zero-knowledge de verdade. A chave é derivada no navegador com PBKDF2 em 600 mil iterações e cada registro sai cifrado com AES-256-GCM antes de tocar a rede. O servidor guarda blob e nem consegue verificar se a senha-mestra está certa.',
            'Troquei o login próprio por Microsoft Entra ID com OIDC e MFA, deixando a autorização em uma camada separada no banco. As 51 Server Actions checam identidade por conta própria, porque Server Action é endpoint HTTP e pode ser chamada sem passar pela tela.',
            'Next.js 16, React 19, Tailwind v4, PostgreSQL no Neon com Drizzle, Auth.js, na Vercel. Integra com Entra ID, Microsoft Graph e a API do help desk.',
          ]),
          g('Sistema de NFS-e · Refatoração de legado', [
            'Refatorei o emissor legado de NFS-e (C#/ASPX, 2015) para a Reforma Tributária de 2025. Um fluxo manual de cinco etapas, que consumia horas por dia, virou uma única ação no backend, hoje rodando milhares de notas por mês para 7 empresas do grupo. Migração para o Emissor Nacional em andamento.',
          ]),
          g('Implantação, treinamento e infraestrutura', [
            'Não existe time de produto formalizado aqui, então as demandas chegam direto a mim. Levanto o requisito, construo protótipo, explico a quem não é programador por que uma abordagem funciona e outra não, e corto escopo quando é o caso.',
            'Conduzo o onboarding e o treinamento dos sistemas que construo, com os times internos de contabilidade e com os usuários do cliente, e dou o suporte de primeira linha depois que entram em operação. Cuido também do ambiente Microsoft 365 e da segurança de endpoint com Trellix ePO.',
          ]),
        ]),
        entry('Engenheiro de Áudio', 'Freelance', '2019 – 2024', '', [
          g('', [
            'Mixagem e masterização, 100% remoto, com vários clientes e prazos rodando em paralelo. Morei e trabalhei em Los Angeles entre 2019 e 2020, onde desenvolvi a fluência em inglês.',
          ]),
        ]),
        entry('Técnico em Hardware', 'OGSX Workstations', '2016 – 2018', 'Fernandópolis, SP', [
          g('', ['Montagem e tuning de workstations de até R$ 60.000 para análise financeira e renderização de vídeo.']),
        ]),
      ],
    },
    {
      id: uid(),
      kind: 'entries',
      title: 'Projetos',
      entries: [
        entry('Plataforma Chammas', 'React 18 · Supabase/PostgreSQL · Anthropic API', '', '', [
          g('', [
            'SaaS de mentoria para vestibulandos de medicina, entregue como freelance e no ar desde junho de 2026 com alunos reais, em plataformachammas.com.',
            'Herdei uma base gerada em ferramenta no-code e auditei tabela por tabela. Achei 17 problemas de segurança, entre eles leitura pública em um canal privado de dúvidas e uma política recursiva que derrubava o painel do mentor em produção. Corrigi todos, validados em ambiente espelhado antes de subir.',
            'A autorização inteira vive no banco, em 133 políticas de Row Level Security. É isso que permite o app conversar direto com o Postgres sem uma API no meio.',
            'O feedback semanal, que era a parte mais cara do serviço do mentor, virou rascunho gerado por IA a partir dos dados reais do aluno, com exemplos do texto dele próprio no prompt. Ele edita e aprova antes de qualquer coisa sair. A IA nunca fala com o aluno.',
          ]),
        ]),
        entry('SENTINELA', 'React 18 · Three.js · satellite.js · Vercel Edge', '', '', [
          g('', [
            'Visualização 3D do congestionamento da órbita baixa terrestre com detecção de conjunções entre objetos, sobre os dados públicos do CelesTrak. Projeto acadêmico da Global Solution da FIAP, feito sozinho do recorte do problema ao design system.',
            '28.757 TLEs processados, até 9.000 objetos propagados por execução com SGP4 e 8.000 renderizados ao mesmo tempo.',
            'Comparar todos os pares seria O(n²) e travaria o navegador, então usei hashing espacial em grid 3D, onde cada objeto só compara com as células vizinhas.',
          ]),
        ]),
      ],
    },
    {
      id: uid(),
      kind: 'entries',
      title: 'Formação',
      entries: [
        entry('Bacharelado em Sistemas de Informação (em andamento)', 'FIAP', 'Jan 2023 – Out 2026', '', [
          g('', [
            'Metodologia baseada em projetos com empresas parceiras: challenges com Natura e Eurofarma apresentados a bancas de executivos, RoboCup em parceria com a SAP e Startup One, com pitch para investidores.',
          ]),
        ]),
      ],
    },
    {
      id: uid(),
      kind: 'list',
      title: 'Cursos e Idiomas',
      items: [
        { id: uid(), text: '**Cursos:** CS50 (Harvard) · Java Masterclass 2025, 130+ horas (Udemy) · 100 Days of Code: Python (Udemy)' },
        { id: uid(), text: '**Idiomas:** Português nativo · Inglês fluente, C1 Avançado (TOEIC 920/990)' },
      ],
    },
  ]

  return {
    name: 'Pedro R. Cavariani',
    headline: 'Desenvolvedor Full Stack Junior | React · Next.js · TypeScript · .NET/C# · SQL Server',
    contacts: contacts(),
    sections,
    vars: [
      { id: uid(), key: 'eventos', value: '16.390' },
      { id: uid(), key: 'lotes', value: '437' },
      { id: uid(), key: 'valor_fiscal', value: 'R$ 71,8 milhões' },
      { id: uid(), key: 'retencoes', value: 'R$ 2,69 milhões' },
      { id: uid(), key: 'aceite', value: '97,1%' },
      { id: uid(), key: 'empresas', value: '33' },
      { id: uid(), key: 'usuarios', value: '26' },
      { id: uid(), key: 'endpoints', value: '56' },
      { id: uid(), key: 'testes', value: '462' },
      { id: uid(), key: 'provisoes', value: '25.300' },
      { id: uid(), key: 'receita', value: 'R$ 69,6 milhões' },
      { id: uid(), key: 'torres', value: '2.640' },
    ],
  }
}

const enCV = (): CV => {
  const sections: Section[] = [
    {
      id: uid(),
      kind: 'summary',
      title: 'Summary',
      text: [
        'Full Stack Developer responsible for the architecture, development and maintenance of four production business systems, plus a commercial SaaS delivered as a freelance project.',
        'Focused on replacing manual processes and legacy systems with modern web applications, from database to interface, with external API integrations, multi-tenant architecture, and security and audit requirements.',
        '**Stack:** React, Next.js, TypeScript, JavaScript, Vue.js, ASP.NET Core, C#, Java, REST APIs, SQL Server, PostgreSQL.',
        'English C1 (TOEIC 920/990). Open to remote work.',
      ].join('\n'),
    },
    {
      id: uid(),
      kind: 'skills',
      title: 'Technical Skills',
      rows: [
        {
          id: uid(),
          label: 'Front-End',
          text: 'React 19, Next.js 16 (App Router, Server Components, Server Actions), TypeScript, JavaScript (ES6+), Vite, Tailwind CSS, HTML5, CSS3, Framer Motion, Recharts, AG Grid, Three.js / React Three Fiber, TanStack Query, Vue.js, Flutter',
        },
        {
          id: uid(),
          label: 'Back-End & APIs',
          text: 'ASP.NET Core 8, C# (.NET), Node.js, Fastify, REST APIs, Edge Functions (Deno), SOAP/XML integration, background workers, Python, Java',
        },
        {
          id: uid(),
          label: 'Databases',
          text: 'SQL Server, PostgreSQL (Supabase, Neon), Entity Framework Core, Prisma, Drizzle ORM. Relational modeling, stored procedures, high-volume query optimization, versioned migrations, Row Level Security',
        },
        {
          id: uid(),
          label: 'Security',
          text: 'JWT, OAuth 2.0 / OpenID Connect (Microsoft Entra ID), MFA, AES-256-GCM, PBKDF2, BCrypt, scrypt, A1 digital certificates (.pfx), RBAC, Content Security Policy, vulnerability auditing',
        },
        {
          id: uid(),
          label: 'Design & Product',
          text: 'Interfaces and design systems for my projects designed from scratch, with no off-the-shelf component library: color and type tokens, component grammar, responsive design',
        },
        {
          id: uid(),
          label: 'Infra & DevOps',
          text: 'IIS, Windows Server, Vercel, PowerShell, Git/GitHub, reverse proxy (URL Rewrite + ARR), Docker (coursework), Agile/Scrum',
        },
        {
          id: uid(),
          label: 'AI & Agents',
          text: 'Day-to-day agent-assisted development: agentic workflows and custom harnesses, custom skills and plugins for Claude Code, context management and technical documentation in CLAUDE.md. AI embedded in product with the Anthropic Messages API and Groq API + LLaMA 3.3 70B, using few-shot prompting and prompt caching',
        },
      ],
    },
    {
      id: uid(),
      kind: 'entries',
      title: 'Professional Experience',
      entries: [
        entry('Full Stack Developer (Junior)', 'MLEGATE', 'Jun 2025 – Present', 'São Paulo, SP', [
          g('', ['Four internal and client systems under my technical ownership, from frontend to database and infrastructure.']),
          g('REINF Platform · Fiscal SaaS in production', [
            '{{eventos}} tax events transmitted in {{lotes}} batches since April 2026, totaling {{valor_fiscal}} in tax values and {{retencoes}} in withholdings.',
            'The acceptance rate went from 47% in the launch month to {{aceite}} over the last 60 days, after I rewrote transmission as a background service tolerant to network failures and Receita timeouts. Since then it has completed 74 of 74 planned batches.',
            'Practically every REINF submission at the company now goes through it. The idea was mine: I spotted the bottleneck, built the first version on my own, and only then presented it to management.',
            'The Receita web service is asynchronous, poorly documented, and returns schemas that are not in the manual. I generate and sign the XMLs with an A1 certificate, poll for the response, handle the off-manual schemas, and translate error codes into something an accountant understands. Nine event types.',
            'What took up to 30 hours in the old WinForms app now takes minutes, with the entire legacy desktop migrated to React 19, Vite and ASP.NET Core 8.',
            'Multi-tenant for {{empresas}} companies and {{usuarios}} users, with certificates encrypted at rest and role-based access. It also ships Rex, an AI assistant with context from the system and the Receita manuals.',
            'Every failure is stored in the database with its reason, not just the code. When something breaks in production I can reconstruct what happened without guessing, and that is how the error rate came down.',
          ]),
          g('BTC Tool · Accounts receivable for a telecom tower operator', [
            'Brazil Tower Company sent unstructured Excel spreadsheets, accounting sent them back for correction, and the cycle repeated several times a month. I built the application that ended that, where provisioning, billing and receipt exist as their own entities.',
            'It writes directly to the ledger of the legacy accounting ERP, which exposes no API. I reimplemented the guarantees on our side: all-or-nothing transactions, debit checked against credit before commit, and the period validated against the legacy calendar.',
            'The application user runs under DENY on UPDATE and DELETE on the ledger. Not even a bug can rewrite accounting history, and corrections only go through reversal entries.',
            '{{endpoints}} REST endpoints, 19 entities and {{testes}} backend tests running against the real database. In production it handles {{provisoes}} provisions and {{receita}} of provisioned revenue across {{torres}} towers. React 19, TypeScript, AG Grid, Node.js with Fastify, Prisma on SQL Server, published on IIS.',
          ]),
          g('Painel TI · Internal operations platform', [
            'Peripheral inventory, credentials, team tasks, system monitoring and a knowledge base lived in loose spreadsheets and WhatsApp. I brought everything into one platform, from idea to live in four days.',
            'The password vault is truly zero-knowledge. The key is derived in the browser with PBKDF2 at 600k iterations and each record is encrypted with AES-256-GCM before touching the network. The server stores a blob and cannot even verify whether the master password is correct.',
            'I replaced the custom login with Microsoft Entra ID using OIDC and MFA, keeping authorization in a separate layer in the database. The 51 Server Actions check identity on their own, because a Server Action is an HTTP endpoint and can be called without going through the UI.',
            'Next.js 16, React 19, Tailwind v4, PostgreSQL on Neon with Drizzle, Auth.js, on Vercel. Integrates with Entra ID, Microsoft Graph and the help desk API.',
          ]),
          g('NFS-e System · Legacy refactor', [
            'I refactored the legacy NFS-e issuer (C#/ASPX, 2015) for the 2025 Tax Reform. A manual five-step flow that took hours every day became a single backend action, now running thousands of invoices per month for 7 group companies. Migration to the National Issuer is in progress.',
          ]),
          g('Rollout, training and infrastructure', [
            'There is no formal product team here, so requests come straight to me. I gather requirements, build prototypes, explain to non-programmers why one approach works and another does not, and cut scope when needed.',
            'I run onboarding and training for the systems I build, with internal accounting teams and client users, and provide first-line support once they go live. I also look after the Microsoft 365 environment and endpoint security with Trellix ePO.',
          ]),
        ]),
        entry('Audio Engineer', 'Freelance', '2019 – 2024', '', [
          g('', [
            'Mixing and mastering, 100% remote, with several clients and deadlines running in parallel. I lived and worked in Los Angeles between 2019 and 2020, where I developed English fluency.',
          ]),
        ]),
        entry('Hardware Technician', 'OGSX Workstations', '2016 – 2018', 'Fernandópolis, SP', [
          g('', ['Assembly and tuning of workstations up to R$ 60,000 for financial analysis and video rendering.']),
        ]),
      ],
    },
    {
      id: uid(),
      kind: 'entries',
      title: 'Projects',
      entries: [
        entry('Plataforma Chammas', 'React 18 · Supabase/PostgreSQL · Anthropic API', '', '', [
          g('', [
            'Mentoring SaaS for medical school entrance exam candidates, delivered as a freelance project and live since June 2026 with real students, at plataformachammas.com.',
            'I inherited a codebase generated in a no-code tool and audited it table by table. I found 17 security issues, including public read access on a private Q&A channel and a recursive policy that took down the mentor dashboard in production. I fixed all of them, validated in a mirrored environment before shipping.',
            'All authorization lives in the database, in 133 Row Level Security policies. That is what lets the app talk directly to Postgres with no API in between.',
            "Weekly feedback, the most expensive part of the mentor's service, became an AI-generated draft built from the student's real data, with examples of the mentor's own writing in the prompt. The mentor edits and approves before anything goes out. The AI never talks to the student.",
          ]),
        ]),
        entry('SENTINELA', 'React 18 · Three.js · satellite.js · Vercel Edge', '', '', [
          g('', [
            "3D visualization of low Earth orbit congestion with conjunction detection between objects, built on public CelesTrak data. Academic project for FIAP's Global Solution, done solo from problem framing to design system.",
            '28,757 TLEs processed, up to 9,000 objects propagated per run with SGP4 and 8,000 rendered at the same time.',
            'Comparing every pair would be O(n²) and freeze the browser, so I used 3D grid spatial hashing, where each object only compares against neighboring cells.',
          ]),
        ]),
      ],
    },
    {
      id: uid(),
      kind: 'entries',
      title: 'Education',
      entries: [
        entry("Bachelor's in Information Systems (in progress)", 'FIAP', 'Jan 2023 – Oct 2026', '', [
          g('', [
            'Project-based methodology with partner companies: challenges with Natura and Eurofarma presented to executive panels, RoboCup in partnership with SAP and Startup One, with an investor pitch.',
          ]),
        ]),
      ],
    },
    {
      id: uid(),
      kind: 'list',
      title: 'Courses & Languages',
      items: [
        { id: uid(), text: '**Courses:** CS50 (Harvard) · Java Masterclass 2025, 130+ hours (Udemy) · 100 Days of Code: Python (Udemy)' },
        { id: uid(), text: '**Languages:** Portuguese native · English fluent, C1 Advanced (TOEIC 920/990)' },
      ],
    },
  ]

  return {
    name: 'Pedro R. Cavariani',
    headline: 'Full Stack Developer | React · Next.js · TypeScript · .NET/C# · SQL Server',
    contacts: contacts(),
    sections,
    vars: [
      { id: uid(), key: 'eventos', value: '16,390' },
      { id: uid(), key: 'lotes', value: '437' },
      { id: uid(), key: 'valor_fiscal', value: 'R$ 71.8 million' },
      { id: uid(), key: 'retencoes', value: 'R$ 2.69 million' },
      { id: uid(), key: 'aceite', value: '97.1%' },
      { id: uid(), key: 'empresas', value: '33' },
      { id: uid(), key: 'usuarios', value: '26' },
      { id: uid(), key: 'endpoints', value: '56' },
      { id: uid(), key: 'testes', value: '462' },
      { id: uid(), key: 'provisoes', value: '25,300' },
      { id: uid(), key: 'receita', value: 'R$ 69.6 million' },
      { id: uid(), key: 'torres', value: '2,640' },
    ],
  }
}

export function seedState(): AppState {
  const now = Date.now()
  const pt: Version = {
    id: 'pt',
    name: 'Full Stack (PT)',
    lang: 'pt',
    cv: ptCV(),
    settings: defaultSettings(),
    updatedAt: now,
  }
  const en: Version = {
    id: 'en',
    name: 'Full Stack (EN)',
    lang: 'en',
    cv: enCV(),
    settings: defaultSettings(),
    updatedAt: now,
  }
  return { versions: [pt, en], activeId: 'pt', snapshots: [] }
}
