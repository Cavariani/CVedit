# CV Studio

Editor de currículo que roda 100% no navegador. Você edita o texto, vê o resultado ao vivo em A4 e exporta em PDF.

## Rodar

```bash
npm install
npm run dev
```

## Deploy na Vercel

Suba o repositório e importe na Vercel. O preset Vite é detectado sozinho (build `vite build`, saída `dist`). Não há backend nem variáveis de ambiente.

## Como usar no dia a dia

- **Editar:** cada seção do painel esquerdo abre e fecha. Arraste pela alça para reordenar, use o olho para esconder sem apagar.
- **Números e métricas:** escreva `{{chave}}` em qualquer texto e o valor definido no card "Números e métricas" entra no lugar. Para atualizar lotes, taxa de aceite ou receita, mude só ali.
- **Versões:** o botão `+` duplica a versão atual como PT ou EN, ou cria uma em branco. Cada versão guarda o próprio texto e o próprio visual.
- **PDF:** botão "Exportar PDF" abre a impressão do navegador. Escolha "Salvar como PDF". No Chrome, deixe "Gráficos de segundo plano" ligado para as cores saírem. O texto continua selecionável e os links funcionam.
- **Backup:** "Backup" baixa um `.json` com todas as versões. "Importar" lê esse arquivo. Versões com o mesmo id são substituídas (a anterior vai para o Histórico), as novas são adicionadas.
- **Histórico:** cada exportação de PDF guarda uma cópia. Também há cópia automática antes de importar, restaurar ou excluir.

Os dados ficam no `localStorage` do navegador. Se trocar de máquina ou limpar os dados do site, use o Backup.

## Estrutura

- `src/types.ts` modelo de dados (o CV é um JSON; os templates só desenham esse JSON)
- `src/seed.ts` conteúdo inicial em PT e EN
- `src/store.ts` estado, persistência, histórico, importação
- `src/Editor.tsx` painel de edição
- `src/Preview.tsx` renderização do CV e preview em A4
- `src/styles.css` interface e os 3 templates (Clássico, Moderno, Compacto)

Para criar um template novo, adicione uma classe `.cv.t-nome` em `styles.css` e a chave em `TemplateKey` e na lista `TEMPLATES` do `App.tsx`.
