export type QrTypeId =
  | 'link'
  | 'social'
  | 'video'
  | 'text'
  | 'wifi'
  | 'vcard'
  | 'pix'
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'phone'
  | 'geo'
  | 'event';

export type FieldKind = 'text' | 'textarea' | 'tel' | 'email' | 'url' | 'date' | 'time' | 'select' | 'checkbox';

export interface FieldOption {
  value: string;
  label: string;
  /** Brand colour shown as a dot on the option chip. */
  color?: string;
}

export interface FieldDef {
  key: string;
  label: string;
  kind?: FieldKind;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  options?: FieldOption[];
  autoComplete?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric' | 'decimal' | 'url';
  maxLength?: number;
  span?: 'full' | 'half';
  /** How a select field is drawn: a dropdown by default, or chips when the options are few and visual. */
  display?: 'chips';
  defaultValue?: string;
}

export interface QrTypeDef {
  id: QrTypeId;
  label: string;
  description: string;
  emptyHint: string;
  tips: string[];
  fields: FieldDef[];
  example: Record<string, string>;
  /** Shows a "Novo" badge on the type picker. */
  isNew?: boolean;
}

export const SOCIAL_NETWORKS: { value: string; label: string; color: string; url: (handle: string) => string }[] = [
  { value: 'instagram', label: 'Instagram', color: '#e1306c', url: (handle) => `https://instagram.com/${handle}` },
  { value: 'tiktok', label: 'TikTok', color: '#111111', url: (handle) => `https://www.tiktok.com/@${handle}` },
  { value: 'youtube', label: 'YouTube', color: '#ff0033', url: (handle) => `https://www.youtube.com/@${handle}` },
  { value: 'x', label: 'X (Twitter)', color: '#111111', url: (handle) => `https://x.com/${handle}` },
  { value: 'linkedin', label: 'LinkedIn', color: '#0a66c2', url: (handle) => `https://www.linkedin.com/in/${handle}` },
  { value: 'facebook', label: 'Facebook', color: '#1877f2', url: (handle) => `https://facebook.com/${handle}` },
  { value: 'threads', label: 'Threads', color: '#111111', url: (handle) => `https://www.threads.net/@${handle}` },
  { value: 'github', label: 'GitHub', color: '#24292f', url: (handle) => `https://github.com/${handle}` },
];

/** "instagram.com/" or "tiktok.com/@": what the typed handle is appended to. */
export function socialPrefix(network: string | undefined): string {
  const item = SOCIAL_NETWORKS.find((entry) => entry.value === network) ?? SOCIAL_NETWORKS[0];
  return item.url('').replace(/^https?:\/\/(www\.)?/, '');
}

export const QR_TYPES: QrTypeDef[] = [
  {
    id: 'link',
    label: 'Link',
    description: 'Abre um endereço na web assim que o código é lido.',
    emptyHint: 'Informe a URL que o código deve abrir.',
    tips: [
      'Endereços curtos geram códigos menos densos e mais fáceis de imprimir pequeno.',
      'O código abre o navegador padrão do aparelho, sem precisar de aplicativo.',
    ],
    fields: [
      {
        key: 'url',
        label: 'URL',
        kind: 'url',
        placeholder: 'Cole ou digite o endereço…',
        hint: 'Sem o https://, completamos o endereço para você.',
        required: true,
        inputMode: 'url',
        autoComplete: 'url',
      },
    ],
    example: { url: 'https://exemplo.com.br' },
  },
  {
    id: 'social',
    label: 'Redes sociais',
    description: 'Leva direto para o seu perfil no Instagram, TikTok, LinkedIn e outras.',
    emptyHint: 'Escolha a rede e informe o seu usuário.',
    isNew: true,
    tips: [
      'O perfil abre no aplicativo da rede quando ele está instalado.',
      'Confira se o perfil é público antes de imprimir.',
    ],
    fields: [
      {
        key: 'network',
        label: 'Rede',
        kind: 'select',
        defaultValue: 'instagram',
        display: 'chips',
        options: SOCIAL_NETWORKS.map(({ value, label, color }) => ({ value, label, color })),
      },
      {
        key: 'handle',
        label: 'Usuário',
        placeholder: 'seu usuário…',
        hint: 'Com ou sem @. Também aceita colar o link do perfil.',
        required: true,
        autoComplete: 'off',
        maxLength: 120,
      },
    ],
    example: { network: 'instagram', handle: 'seuperfil' },
  },
  {
    id: 'video',
    label: 'Vídeo',
    description: 'Abre um vídeo do YouTube, Vimeo ou outro site com um escaneamento.',
    emptyHint: 'Cole o link do vídeo.',
    isNew: true,
    tips: [
      'Links do YouTube são encurtados para youtu.be, o que deixa o código menos denso.',
      'Vídeos privados não abrem para quem escanear.',
    ],
    fields: [
      {
        key: 'url',
        label: 'Link do vídeo',
        kind: 'url',
        placeholder: 'Cole o link do vídeo…',
        required: true,
        inputMode: 'url',
        autoComplete: 'url',
      },
    ],
    example: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  },
  {
    id: 'text',
    label: 'Texto',
    description: 'Qualquer texto simples: uma mensagem, um código, uma instrução.',
    emptyHint: 'Escreva o texto que o código deve mostrar.',
    tips: [
      'Textos longos aumentam a densidade do código.',
      'Para mensagens grandes, um link costuma ser mais confortável de ler.',
    ],
    fields: [
      {
        key: 'text',
        label: 'Texto',
        kind: 'textarea',
        placeholder: 'Escreva o texto que vai aparecer…',
        required: true,
        maxLength: 1200,
      },
    ],
    example: { text: 'Olá! Este QR Code foi criado no gerador.' },
  },
  {
    id: 'wifi',
    label: 'Wi-Fi',
    description: 'Conecta o celular à sua rede sem digitar a senha.',
    emptyHint: 'Informe o nome da rede para gerar o acesso.',
    tips: [
      'A senha fica legível para quem escanear. Não use em redes públicas.',
      'Redes ocultas podem exigir uma configuração manual no aparelho.',
    ],
    fields: [
      {
        key: 'ssid',
        label: 'Nome da rede (SSID)',
        placeholder: 'Nome da rede, como aparece no celular…',
        required: true,
        autoComplete: 'off',
      },
      {
        key: 'password',
        label: 'Senha',
        placeholder: 'Senha da rede…',
        hint: 'Fica em texto dentro do código. Não use em redes públicas.',
        autoComplete: 'off',
      },
      {
        key: 'encryption',
        label: 'Segurança',
        kind: 'select',
        display: 'chips',
        defaultValue: 'WPA',
        options: [
          { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
          { value: 'WEP', label: 'WEP' },
          { value: 'nopass', label: 'Rede aberta' },
        ],
      },
      { key: 'hidden', label: 'Rede oculta', kind: 'checkbox' },
    ],
    example: { ssid: 'MinhaRede', password: 'senha123', encryption: 'WPA' },
  },
  {
    id: 'vcard',
    label: 'Contato',
    description: 'Salva seus dados na agenda de quem escanear.',
    emptyHint: 'Informe ao menos o nome para gerar o contato.',
    tips: ['Telefone e e-mail tornam o contato completo na agenda.', 'Quem escanear vê os dados antes de salvar.'],
    fields: [
      { key: 'name', label: 'Nome', placeholder: 'Nome completo…', required: true, autoComplete: 'name' },
      { key: 'org', label: 'Empresa', placeholder: 'Nome da empresa…', autoComplete: 'organization' },
      { key: 'role', label: 'Cargo', placeholder: 'Seu cargo…', autoComplete: 'organization-title' },
      {
        key: 'phone',
        label: 'Telefone',
        kind: 'tel',
        placeholder: 'DDD e número…',
        inputMode: 'tel',
        autoComplete: 'tel',
      },
      {
        key: 'email',
        label: 'E-mail',
        kind: 'email',
        placeholder: 'E-mail de contato…',
        inputMode: 'email',
        autoComplete: 'email',
      },
      {
        key: 'website',
        label: 'Site',
        kind: 'url',
        placeholder: 'Endereço do site…',
        inputMode: 'url',
        autoComplete: 'url',
      },
      {
        key: 'address',
        label: 'Endereço',
        placeholder: 'Rua, número e cidade…',
        autoComplete: 'street-address',
      },
    ],
    example: {
      name: 'Ana Souza',
      org: 'Ateliê Souza',
      role: 'Designer',
      phone: '+55 11 99999-0000',
      email: 'ana@exemplo.com.br',
      website: 'https://exemplo.com.br',
      address: 'Rua das Flores, 12 — São Paulo',
    },
  },
  {
    id: 'pix',
    label: 'PIX',
    description: 'Abre o PIX com chave, valor e recebedor já preenchidos.',
    emptyHint: 'Informe a chave, o recebedor e a cidade para gerar o PIX.',
    tips: [
      'Confira a chave e o nome do recebedor antes de imprimir.',
      'Sem valor, quem paga escolhe a quantia no aplicativo do banco.',
    ],
    fields: [
      {
        key: 'key',
        label: 'Chave PIX',
        placeholder: 'CPF, e-mail, telefone ou chave aleatória…',
        hint: 'E-mail, telefone, CPF/CNPJ ou chave aleatória.',
        required: true,
        autoComplete: 'off',
      },
      {
        key: 'name',
        label: 'Nome do recebedor',
        placeholder: 'Nome de quem recebe…',
        hint: 'Até 25 caracteres.',
        required: true,
        maxLength: 25,
        autoComplete: 'name',
      },
      {
        key: 'city',
        label: 'Cidade do recebedor',
        placeholder: 'Cidade de quem recebe…',
        hint: 'Até 15 caracteres.',
        required: true,
        maxLength: 15,
        autoComplete: 'address-level2',
      },
      {
        key: 'amount',
        label: 'Valor',
        placeholder: 'Vazio para valor livre…',
        hint: 'Opcional. Deixe vazio para quem paga escolher o valor.',
        inputMode: 'decimal',
        maxLength: 12,
      },
      {
        key: 'txid',
        label: 'Identificador',
        placeholder: 'Opcional…',
        hint: 'Opcional, até 25 letras ou números. Sem espaços.',
        maxLength: 25,
        autoComplete: 'off',
      },
    ],
    example: {
      key: 'ana@exemplo.com.br',
      name: 'Ana Souza',
      city: 'São Paulo',
      amount: '35,00',
      txid: 'pedido123',
    },
  },
  {
    id: 'email',
    label: 'E-mail',
    description: 'Abre um e-mail com destinatário, assunto e mensagem.',
    emptyHint: 'Informe o destinatário para gerar o e-mail.',
    tips: [
      'Um assunto claro ajuda quem escaneia a reconhecer o pedido.',
      'O aplicativo de e-mail do aparelho abre com a mensagem pronta.',
    ],
    fields: [
      {
        key: 'to',
        label: 'Para',
        kind: 'email',
        placeholder: 'E-mail de quem recebe…',
        required: true,
        inputMode: 'email',
        autoComplete: 'email',
      },
      { key: 'subject', label: 'Assunto', placeholder: 'Assunto do e-mail…', autoComplete: 'off' },
      {
        key: 'body',
        label: 'Mensagem',
        kind: 'textarea',
        placeholder: 'Mensagem que já vem escrita…',
        maxLength: 800,
      },
    ],
    example: {
      to: 'contato@exemplo.com.br',
      subject: 'Orçamento de impressão',
      body: 'Olá! Gostaria de saber mais sobre os serviços.',
    },
  },
  {
    id: 'sms',
    label: 'SMS',
    description: 'Prepara uma mensagem de texto para o número escolhido.',
    emptyHint: 'Informe o número para gerar o SMS.',
    tips: [
      'A operadora pode cobrar pelo envio da mensagem.',
      'Mantenha o texto curto para caber em uma única mensagem.',
    ],
    fields: [
      {
        key: 'number',
        label: 'Número',
        kind: 'tel',
        placeholder: 'DDD e número…',
        required: true,
        inputMode: 'tel',
        autoComplete: 'tel',
      },
      {
        key: 'message',
        label: 'Mensagem',
        kind: 'textarea',
        placeholder: 'Mensagem que já vem escrita…',
        maxLength: 500,
      },
    ],
    example: { number: '+55 11 99999-0000', message: 'Olá! Cheguei ao endereço combinado.' },
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Abre uma conversa no WhatsApp com a mensagem pronta.',
    emptyHint: 'Informe o número para gerar a conversa.',
    tips: ['Escolha o país e digite o número com DDD.', 'A conversa abre no WhatsApp Web ou no aplicativo instalado.'],
    fields: [
      {
        key: 'number',
        label: 'Número',
        kind: 'tel',
        placeholder: 'DDD e número…',
        required: true,
        inputMode: 'tel',
        autoComplete: 'tel',
      },
      {
        key: 'message',
        label: 'Mensagem',
        kind: 'textarea',
        placeholder: 'Mensagem que já vem escrita…',
        maxLength: 500,
      },
    ],
    example: { number: '5511999990000', message: 'Olá! Vi seu QR Code e quero saber mais.' },
  },
  {
    id: 'phone',
    label: 'Telefone',
    description: 'Disca para o número assim que o código é lido.',
    emptyHint: 'Informe o número para gerar a ligação.',
    tips: [
      'O aparelho só disca depois da confirmação de quem escaneia.',
      'Para números de fora do Brasil, troque o país ao lado do número.',
    ],
    fields: [
      {
        key: 'number',
        label: 'Número',
        kind: 'tel',
        placeholder: 'DDD e número…',
        required: true,
        inputMode: 'tel',
        autoComplete: 'tel',
      },
    ],
    example: { number: '+55 11 99999-0000' },
  },
  {
    id: 'geo',
    label: 'Localização',
    description: 'Abre o mapa em um ponto exato.',
    emptyHint: 'Informe latitude e longitude para gerar o mapa.',
    tips: [
      'Use ponto ou vírgula nas coordenadas. As duas formas funcionam.',
      'No Google Maps, toque e segure o ponto para copiar as coordenadas.',
    ],
    fields: [
      {
        key: 'latitude',
        label: 'Latitude',
        placeholder: 'Ex.: -23,5505',
        hint: 'Copie as coordenadas no Google Maps.',
        required: true,
        inputMode: 'decimal',
        span: 'half',
      },
      {
        key: 'longitude',
        label: 'Longitude',
        placeholder: 'Ex.: -46,6333',
        required: true,
        inputMode: 'decimal',
        span: 'half',
      },
    ],
    example: { latitude: '-23,5505', longitude: '-46,6333' },
  },
  {
    id: 'event',
    label: 'Evento',
    description: 'Adiciona um compromisso à agenda com data, hora e local.',
    emptyHint: 'Informe o título, a data e a hora de início.',
    tips: ['O compromisso é salvo no calendário do aparelho.', 'O horário é interpretado no fuso de quem escaneia.'],
    fields: [
      { key: 'title', label: 'Título', placeholder: 'Nome do evento…', required: true, autoComplete: 'off' },
      { key: 'location', label: 'Local', placeholder: 'Endereço ou nome do lugar…', autoComplete: 'off' },
      {
        key: 'startDate',
        label: 'Data de início',
        kind: 'date',
        required: true,
        span: 'half',
      },
      { key: 'startTime', label: 'Hora de início', kind: 'time', required: true, span: 'half' },
      { key: 'endDate', label: 'Data de término', kind: 'date', span: 'half' },
      { key: 'endTime', label: 'Hora de término', kind: 'time', span: 'half' },
      {
        key: 'description',
        label: 'Descrição',
        kind: 'textarea',
        placeholder: 'Detalhes para quem vai…',
        maxLength: 500,
      },
    ],
    example: {
      title: 'Abertura da exposição',
      location: 'Galeria Central',
      startDate: '2026-11-12',
      startTime: '19:00',
      endDate: '2026-11-12',
      endTime: '22:00',
      description: 'Conversa com os artistas e visita guiada.',
    },
  },
];

export const QR_TYPE_BY_ID = Object.fromEntries(QR_TYPES.map((type) => [type.id, type])) as Record<QrTypeId, QrTypeDef>;

export type ModuleShape = 'square' | 'rounded' | 'dots';
export type EyeShape = 'square' | 'rounded' | 'circle';
export type ErrorCorrection = 'L' | 'M' | 'Q' | 'H';
export type FrameId = 'none' | 'banner' | 'header' | 'outline' | 'bubble' | 'corners';
export type ExportFormat = 'png' | 'svg' | 'jpeg';

export interface LogoState {
  dataUrl: string;
  name: string;
  size: number;
}

export interface QrStyle {
  fg: string;
  bg: string;
  moduleShape: ModuleShape;
  eyeShape: EyeShape;
  margin: number;
  errorCorrection: ErrorCorrection;
  logo: LogoState | null;
  frame: FrameId;
  frameText: string;
  frameColor: string;
}

export interface ExportPrefs {
  format: ExportFormat;
  size: number;
  filename: string;
}

export interface StudioState {
  type: QrTypeId;
  values: Record<string, Record<string, string>>;
  style: QrStyle;
  exportPrefs: ExportPrefs;
}

export const ERROR_CORRECTION_LABELS: Record<ErrorCorrection, string> = {
  L: 'L · 7% de recuperação',
  M: 'M · 15% de recuperação',
  Q: 'Q · 25% de recuperação',
  H: 'H · 30% de recuperação',
};

export const MODULE_SHAPE_LABELS: Record<ModuleShape, string> = {
  square: 'Quadrado',
  rounded: 'Arredondado',
  dots: 'Pontos',
};

export const EYE_SHAPE_LABELS: Record<EyeShape, string> = {
  square: 'Quadrado',
  rounded: 'Arredondado',
  circle: 'Círculo',
};

export const DEFAULT_STYLE: QrStyle = {
  fg: '#000000',
  bg: '#ffffff',
  moduleShape: 'square',
  eyeShape: 'square',
  margin: 4,
  errorCorrection: 'M',
  logo: null,
  frame: 'none',
  frameText: 'Escaneie-me',
  frameColor: '#171717',
};

export const FRAMES: { id: FrameId; label: string }[] = [
  { id: 'none', label: 'Nenhuma' },
  { id: 'banner', label: 'Faixa' },
  { id: 'header', label: 'Topo' },
  { id: 'outline', label: 'Contorno' },
  { id: 'bubble', label: 'Balão' },
  { id: 'corners', label: 'Cantos' },
];

export const DEFAULT_EXPORT: ExportPrefs = {
  format: 'png',
  size: 1024,
  filename: '',
};

export const COLOR_PRESETS: { label: string; fg: string; bg: string }[] = [
  { label: 'Tinta', fg: '#000000', bg: '#ffffff' },
  { label: 'Petróleo', fg: '#1b6c80', bg: '#ffffff' },
  { label: 'Floresta', fg: '#1e5b3a', bg: '#ffffff' },
  { label: 'Vinho', fg: '#7a1f28', bg: '#ffffff' },
  { label: 'Cobalto', fg: '#1d3f8f', bg: '#ffffff' },
  { label: 'Papel', fg: '#1c1a17', bg: '#f3f1ea' },
];
