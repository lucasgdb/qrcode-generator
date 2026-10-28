# Gerador de QR Code

Uma bancada para criar, personalizar e conferir QR Codes no navegador. O código é gerado no cliente, sem enviar conteúdo para nenhum servidor, e sai em PNG, SVG ou JPEG.

## O que dá para criar

- **Link** para uma página, **redes sociais** (Instagram, TikTok, YouTube, X, LinkedIn, Facebook, Threads, GitHub), **vídeo** (links do YouTube viram youtu.be, mais curtos), **texto** livre, **Wi-Fi**, **contato (vCard)**, **PIX** (BR Code estático com CRC16), **e-mail**, **SMS**, **WhatsApp**, **telefone**, **localização** e **evento** de calendário.
- **Estilo**: cor do código e do fundo com presets, formato dos módulos (quadrado, arredondado, pontos), formato dos olhos (quadrado, arredondado, círculo), margem de silêncio e nível de correção de erros.
- **Logo** enviado por arquivo ou arrastado, com tamanho ajustável e aviso quando a área coberta pede uma correção maior.
- **Exportação** em PNG (512 a 4096 px), SVG vetorial e JPEG, com nome de arquivo editável e cópia da imagem para a área de transferência.
- **Conferência de leitura** ao vivo: contraste, quantidade de módulos, versão, correção e avisos de margem, inversão e densidade.
- **Conteúdo codificado** visível e copiável (útil para PIX e vCard).
- **Preferências salvas** no `localStorage` (estilo, moldura, logo e formato do arquivo). O que você digita nunca é salvo: cada visita começa com os campos vazios, e “Preencher exemplo” preenche um exemplo na hora.
- **Telefones com país**: SMS, WhatsApp, ligação e contato têm seletor de país (+55, +351, +1…) junto do número.
- **Nome do QR Code** na etapa de conteúdo, usado como nome do arquivo.
- **Molduras** (faixa, topo, contorno, balão e cantos) com texto e cor editáveis, incluídas no PNG, SVG e JPEG.
- **Atalho** Ctrl+S (ou ⌘S) baixa o código no formato escolhido.
- **Tamanho mínimo de impressão** calculado a partir dos módulos (cerca de 0,5 mm por módulo).

## Stack

- Next.js 16 (Pages Router) e React 19
- TypeScript 5.9
- Tailwind CSS 4
- Design system com [shadcn/ui](https://ui.shadcn.com) sobre [Base UI](https://base-ui.com) em `src/components/ui` (botão, input, textarea, select, checkbox, abas, toggle group, slider, tooltip, badge, label); os tokens ficam em `globals.css` com os nomes do shadcn (`--primary`, `--border`, `--muted-foreground`…)
- [`qrcode-generator`](https://www.npmjs.com/package/qrcode-generator) para a matriz do QR e um renderizador SVG próprio para módulos, olhos e logo
- Geist servida localmente em `public/fonts` (licença SIL OFL em `public/fonts/OFL.txt`)

## Design

O gerador é um assistente em três etapas, com o tipo escolhido no caminho da URL (`/sms`). Cada tipo é pré-renderizado pelo Next, então um F5 ou um link copiado já abre a etapa certa, sem pular de tela. A etapa de design é um estado da própria página (sem URL própria, já que aberta direto não teria conteúdo), e o botão Voltar do navegador percorre as três etapas. Links antigos com `#/sms` são redirecionados. Não há tipo pré-selecionado: a etapa 2 só abre ao clicar em um card, e pelas etapas do topo só dá para voltar:

1. **Tipo**: cards com ícone e descrição de cada tipo de conteúdo.
2. **Conteúdo**: formulário à esquerda e, à direita, um celular mostrando o que aparece para quem escanear (a página, a mensagem de SMS, o contato, o PIX…), atualizado enquanto você digita.
3. **Personalizar e baixar**: molduras com texto ("Escaneie-me"), cores, formato dos módulos e dos olhos, logo e o arquivo final, com a prévia fiel ao download.

O topo mostra só as etapas, centralizadas, com a linha de progresso preenchendo de 0 a 100% e o número virando ✓ com transição suave; a marca fica acima do título na primeira etapa. A troca de etapa usa a View Transitions API do navegador (a página desliza e funde, espelhada ao voltar; sem animação com movimento reduzido ou em navegadores sem suporte). As cores seguem o tema claro do [lucasbittencourt.dev](https://lucasbittencourt.dev): a escala neutral do Tailwind, cards brancos sobre #fafafa, ação principal quase preta e a fonte Geist; a cor fica só nos ícones de cada tipo e no próprio QR Code. Em telas grandes, a barra de ações gruda no rodapé da janela para o Avançar ficar sempre à vista. No celular, a barra de ações fica fixa no rodapé e, na etapa 3, uma miniatura do código acompanha a rolagem.

## Rodando o projeto

Requer Node.js 20.9 ou superior e [pnpm](https://pnpm.io) (a versão está fixada em `packageManager` no `package.json`).

```bash
pnpm install
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000).

```bash
pnpm build && pnpm start   # build de produção
pnpm lint                  # ESLint
pnpm typecheck             # TypeScript
pnpm format                # Prettier
```

## Estrutura

```
src/
  components/     etapas, prévias e campos do app
  components/ui/  design system (shadcn + Base UI)
  hooks/          estado do estúdio, rascunho e ações
  lib/
    payload.ts    montagem dos conteúdos (Wi-Fi, vCard, PIX, iCal…)
    qr.ts         matriz, geometria e SVG do código
    scan.ts       contraste e auditoria de leitura
    export.ts     PNG/JPEG, download, clipboard e logo
    types.ts      tipos de conteúdo, campos e presets
  pages/          Next.js (index, _app, _document)
  styles/         tokens, componentes e responsivo
```

## Notas técnicas

- O QR é codificado em UTF-8, então acentos e emojis no conteúdo funcionam.
- O PIX segue o BR Code estático do Banco Central, com CRC16/CCITT-FALSE e campos normalizados.
- O preview é SVG; PNG e JPEG são rasterizados no navegador em um canvas na resolução escolhida.
- As preferências ficam em `localStorage` na chave `qr-studio:v1`, sem nenhum conteúdo digitado. Se o armazenamento estiver bloqueado, o app continua funcionando sem salvar.
- Módulos quadrados são desenhados como faixas horizontais, o que reduz bastante o path do SVG (prévia mais leve e arquivo menor).
- A matriz e o desenho seguem o texto com `useDeferredValue`, então digitar conteúdo longo nunca trava o campo.
- Nenhum conteúdo, chave PIX, senha de Wi-Fi ou logo é enviado para fora do navegador.
