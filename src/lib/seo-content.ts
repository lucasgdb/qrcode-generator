// Search and answer-engine copy (pt-BR). Every FAQ here is also shown on its page:
// Google only uses FAQ structured data that matches visible content.

import type { QrTypeId } from './types';

export interface Faq {
  question: string;
  answer: string;
}

/** A short section of the page's guide: a heading and one to three paragraphs. */
export interface GuideSection {
  heading: string;
  paragraphs: string[];
}

export interface Source {
  label: string;
  href: string;
}

export interface TypeSeo {
  /** The <title>; the site name is added only when the title doesn't already say "Gerador". */
  title: string;
  /** Meta description: what the page does, in under ~155 characters. */
  description: string;
  /** Short phrase used in headings, alt text and llms.txt ("QR Code de Wi-Fi"). */
  name: string;
  faq: Faq[];
  /** Below the form: when to use this type and what to know, for people and answer engines. */
  guide: GuideSection[];
  /** Official references cited at the end of the guide. */
  sources?: Source[];
  /** Other types linked from this page ("Outros tipos de QR Code"), most related first. */
  related: QrTypeId[];
}

export const homeSeo = {
  title: 'Gerador de QR Code grátis: link, PIX, Wi-Fi e WhatsApp',
  description:
    'Crie QR Codes grátis de link, PIX, Wi-Fi, WhatsApp, contato, evento e mais. Personalize cores, moldura e logo e baixe em PNG, SVG ou JPEG, sem cadastro.',
  faq: [
    {
      question: 'O gerador de QR Code é grátis?',
      answer:
        'Sim. Todos os tipos, molduras, cores, logo e downloads em PNG, SVG e JPEG são gratuitos, sem cadastro, sem marca d’água e sem limite de uso.',
    },
    {
      question: 'O QR Code criado aqui expira?',
      answer:
        'Não. O código é estático: o conteúdo fica gravado no próprio desenho, sem passar por nenhum servidor de redirecionamento. Ele funciona enquanto o destino (o link, a rede, a chave PIX) existir.',
    },
    {
      question: 'Meus dados são enviados para algum servidor?',
      answer:
        'Não. O QR Code é gerado no seu navegador. Links, senhas de Wi-Fi, chaves PIX e contatos não saem do seu aparelho e não ficam salvos.',
    },
    {
      question: 'Qual formato devo baixar para imprimir?',
      answer:
        'Use SVG, que é vetorial e não perde qualidade em nenhum tamanho, ou PNG em 2048 px. JPEG serve para envio rápido, mas não tem fundo transparente nem a mesma nitidez.',
    },
    {
      question: 'Posso colocar o logo da minha marca no QR Code?',
      answer:
        'Sim. Envie a imagem na aba Logo. O gerador sobe a correção de erros para Q automaticamente, para o código continuar legível com o logo cobrindo parte dos módulos.',
    },
    {
      question: 'Qual o tamanho mínimo para imprimir um QR Code?',
      answer:
        'Para leitura a até cerca de 20 cm, 2 cm de largura costumam bastar. Quanto mais conteúdo, mais módulos e maior o tamanho necessário; o gerador mostra a largura mínima recomendada para cada código.',
    },
  ] satisfies Faq[],
};

export const typeSeo: Record<QrTypeId, TypeSeo> = {
  link: {
    name: 'QR Code de link',
    title: 'Gerador de QR Code de link (URL) grátis',
    description:
      'Transforme qualquer link em QR Code grátis. Cole a URL, personalize cores, moldura e logo e baixe em PNG ou SVG. Sem cadastro e sem expirar.',
    faq: [
      {
        question: 'Como criar um QR Code de um link?',
        answer:
          'Cole o endereço no campo URL, clique em Avançar, ajuste a aparência se quiser e baixe. O https:// é completado automaticamente.',
      },
      {
        question: 'Posso trocar o link depois de imprimir?',
        answer:
          'Não. Este é um QR Code estático: o link fica gravado no código. Para mudar o destino depois de impresso, aponte o QR para uma página sua e altere o conteúdo dessa página.',
      },
      {
        question: 'Preciso de um encurtador de link?',
        answer:
          'Não. Links longos funcionam, só geram um código mais denso. Encurtadores de terceiros podem sair do ar ou mostrar anúncios e, com isso, quebrar o QR Code já impresso. Prefira um endereço curto do seu próprio site.',
      },
    ],
    guide: [
      {
        heading: 'Quando usar um QR Code de link',
        paragraphs: [
          'Para levar quem escaneia a um cardápio, um site, um formulário, um catálogo, um currículo ou a página de um evento. O código abre o navegador do celular direto no endereço, sem precisar de aplicativo.',
          'O link fica gravado no próprio código. Prefira endereços curtos e definitivos: quanto mais curto, menos módulos e mais fácil de ler de longe ou impresso pequeno. Se o destino puder mudar, aponte para uma página sua (como seusite.com.br/cardapio) e atualize a página, não o código.',
        ],
      },
    ],
    related: ['social', 'video', 'whatsapp', 'pix'],
  },
  social: {
    name: 'QR Code de redes sociais',
    title: 'QR Code para Instagram e TikTok grátis',
    description:
      'Crie um QR Code que abre seu perfil no Instagram, TikTok, YouTube, LinkedIn, X ou GitHub. Grátis, com moldura e logo, para imprimir ou compartilhar.',
    faq: [
      {
        question: 'Como fazer um QR Code do meu Instagram?',
        answer:
          'Escolha Instagram, digite seu usuário (com ou sem @) e avance. O código abre direto o seu perfil, no aplicativo quando ele está instalado.',
      },
      {
        question: 'Funciona com outras redes além do Instagram?',
        answer:
          'Sim: TikTok, YouTube, X (Twitter), LinkedIn, Facebook, Threads e GitHub. Também dá para colar o link completo de qualquer perfil.',
      },
      {
        question: 'Posso colocar várias redes num só QR Code?',
        answer:
          'Não diretamente: cada QR Code abre um único endereço. Crie uma página de links (como a da sua bio) e gere um QR Code de link para ela, ou faça um código para cada rede.',
      },
    ],
    guide: [
      {
        heading: 'Onde usar o QR Code das redes sociais',
        paragraphs: [
          'Na vitrine, no balcão, no cartão de visita, na embalagem, no crachá ou no último slide de uma palestra. O código abre o perfil no aplicativo da rede quando ele está instalado e no navegador quando não está.',
          'Digite só o usuário: o gerador monta o endereço certo de cada rede, como instagram.com/usuario ou tiktok.com/@usuario. Use a moldura com um convite claro, como “Siga no Instagram”, para quem passa saber o que vai abrir.',
        ],
      },
    ],
    related: ['link', 'whatsapp', 'video', 'vcard'],
  },
  video: {
    name: 'QR Code de vídeo',
    title: 'QR Code de vídeo do YouTube grátis',
    description:
      'Crie um QR Code que abre um vídeo do YouTube, Vimeo ou outro site. Links do YouTube são encurtados para gerar um código menor e mais fácil de ler.',
    faq: [
      {
        question: 'Como fazer um QR Code de um vídeo do YouTube?',
        answer:
          'Cole o link do vídeo e avance. O gerador converte o endereço para youtu.be, mais curto, o que deixa o código menos denso e mais fácil de escanear.',
      },
      {
        question: 'O vídeo abre num tempo específico?',
        answer: 'Sim, se o link tiver o parâmetro de tempo (como ?t=42). Ele é mantido no QR Code.',
      },
      {
        question: 'Funciona com vídeo não listado do YouTube?',
        answer:
          'Sim. Vídeos não listados abrem para qualquer pessoa que tenha o link, inclusive quem escanear o código. Vídeos privados não abrem.',
      },
    ],
    guide: [
      {
        heading: 'Onde usar um QR Code de vídeo',
        paragraphs: [
          'Em manuais e embalagens (“veja como montar”), aulas e apostilas, cardápios com o preparo do prato, convites e currículos em vídeo. Quem escaneia assiste no celular, sem digitar nada.',
          'Links do YouTube viram youtu.be, um terço mais curtos, o que reduz o número de módulos e facilita a leitura em códigos pequenos. Shorts, lives e links com tempo (?t=) são reconhecidos. Links do Vimeo ou de outros sites são usados como estão.',
        ],
      },
    ],
    related: ['link', 'social', 'text', 'event'],
  },
  text: {
    name: 'QR Code de texto',
    title: 'Gerador de QR Code de texto grátis',
    description:
      'Coloque qualquer mensagem ou instrução num QR Code. O texto aparece na tela de quem escanear, sem precisar de internet. Grátis e sem cadastro.',
    faq: [
      {
        question: 'Um QR Code de texto precisa de internet?',
        answer: 'Não. O texto fica dentro do próprio código e aparece na câmera de quem escanear, mesmo offline.',
      },
      {
        question: 'Quanto texto cabe num QR Code?',
        answer:
          'Até alguns milhares de caracteres, mas textos longos geram códigos muito densos. Para mensagens grandes, um link para uma página costuma ser melhor.',
      },
      {
        question: 'O texto pode ter acentos e emojis?',
        answer:
          'Sim. O texto é gravado em UTF-8, então acentos, cedilha e emojis aparecem corretamente na maioria dos leitores. Cada emoji ocupa mais espaço que uma letra e deixa o código um pouco mais denso.',
      },
    ],
    guide: [
      {
        heading: 'Para que serve um QR Code de texto',
        paragraphs: [
          'Instruções de uso, números de série, mensagens em presentes, pistas de caça ao tesouro, etiquetas de inventário e avisos em outros idiomas. O texto aparece na tela de quem escanear, mesmo sem internet, mas não abre site nem aplicativo.',
          'Quanto mais texto, mais denso o código. Até algumas centenas de caracteres ele continua fácil de ler; acima disso, imprima maior ou troque por um link para uma página com o texto completo.',
        ],
      },
    ],
    related: ['link', 'wifi', 'vcard', 'email'],
  },
  wifi: {
    name: 'QR Code de Wi-Fi',
    title: 'QR Code de Wi-Fi grátis: conecte sem senha',
    description:
      'Crie um QR Code de Wi-Fi para convidados e clientes conectarem sem digitar a senha. Funciona no iPhone e no Android. Grátis e gerado no navegador.',
    faq: [
      {
        question: 'Como criar um QR Code para a senha do Wi-Fi?',
        answer:
          'Informe o nome da rede (SSID), a senha e o tipo de segurança (geralmente WPA/WPA2). Ao escanear, o celular oferece conectar à rede automaticamente.',
      },
      {
        question: 'Funciona no iPhone e no Android?',
        answer:
          'Sim. A câmera do iPhone (iOS 11 ou mais recente) e a maioria dos Android leem QR Codes de Wi-Fi nativamente.',
      },
      {
        question: 'É seguro colocar a senha do Wi-Fi num QR Code?',
        answer:
          'A senha fica legível para quem escanear, então use para redes de convidados. Ela nunca é enviada a um servidor: o código é gerado no seu navegador.',
      },
      {
        question: 'O QR Code de Wi-Fi para de funcionar se eu trocar a senha?',
        answer:
          'Sim. A senha fica gravada no código, então, ao trocar a senha ou o nome da rede, gere e imprima um código novo. O antigo deixa de conectar.',
      },
    ],
    guide: [
      {
        heading: 'Onde usar o QR Code de Wi-Fi',
        paragraphs: [
          'Na recepção, na mesa de um café ou restaurante, no quarto de uma pousada, na sala de reunião ou na porta da geladeira para as visitas. Quem escaneia conecta sem digitar a senha, sem errar maiúsculas e símbolos.',
        ],
      },
      {
        heading: 'O celular já compartilha o Wi-Fi: por que gerar aqui?',
        paragraphs: [
          'O Android, e o app Senhas nas versões recentes do iPhone, mostram um QR Code da rede, mas só na tela do aparelho. Aqui você gera um arquivo para imprimir, com moldura, um texto como “Wi-Fi grátis” e o logo do local, que fica na parede e atende qualquer convidado.',
        ],
      },
      {
        heading: 'Use uma rede de convidados',
        paragraphs: [
          'A senha fica legível para quem ler o código. Em empresas e comércios, crie no roteador uma rede de convidados, separada da rede de computadores e câmeras, e gere o QR Code dela.',
        ],
      },
    ],
    related: ['text', 'link', 'pix', 'whatsapp'],
  },
  vcard: {
    name: 'QR Code de contato (vCard)',
    title: 'QR Code de cartão de visita (vCard) grátis',
    description:
      'Crie um cartão de visita digital em QR Code: nome, empresa, telefone, e-mail e site salvos na agenda com um escaneamento. Grátis, no formato vCard.',
    faq: [
      {
        question: 'Como criar um QR Code de cartão de visita?',
        answer:
          'Preencha nome, empresa, cargo, telefone, e-mail e site. O código usa o padrão vCard, que o celular reconhece e oferece salvar como contato.',
      },
      {
        question: 'Preciso preencher todos os campos?',
        answer: 'Não. Só o nome é obrigatório; os outros campos entram no contato quando preenchidos.',
      },
      {
        question: 'Os dados do contato ficam salvos em algum lugar online?',
        answer:
          'Não. Os dados ficam dentro do próprio código, no formato vCard, e são gerados no seu navegador. Nada é enviado a servidores.',
      },
      {
        question: 'Posso atualizar o contato depois de imprimir?',
        answer:
          'Não. O QR Code é estático: para mudar telefone, cargo ou e-mail, gere um código novo. Para dados que mudam com frequência, use um QR Code de link para uma página sua.',
      },
    ],
    guide: [
      {
        heading: 'Cartão de visita digital em QR Code',
        paragraphs: [
          'Coloque o código no verso do cartão impresso, no crachá, no estande de uma feira ou no fim de uma apresentação. Ao escanear, o celular mostra os dados e oferece salvar o contato, sem digitar nada nem instalar aplicativo.',
          'O código usa o vCard 3.0, lido pelo iPhone e pelo Android. Quanto mais campos, mais denso o código: em cartões pequenos, fique com nome, telefone, e-mail e site.',
        ],
      },
    ],
    related: ['phone', 'email', 'whatsapp', 'link'],
  },
  pix: {
    name: 'QR Code PIX',
    title: 'Gerador de QR Code PIX grátis (BR Code)',
    description:
      'Gere um QR Code PIX estático com chave, recebedor, cidade e valor opcional, no padrão BR Code do Banco Central. Grátis, sem cadastro e no navegador.',
    faq: [
      {
        question: 'Como gerar um QR Code PIX?',
        answer:
          'Informe sua chave PIX (CPF, CNPJ, e-mail, telefone ou aleatória), o nome e a cidade de quem recebe e, se quiser, o valor. O código segue o padrão BR Code do Banco Central.',
      },
      {
        question: 'Posso gerar um QR Code PIX sem valor definido?',
        answer:
          'Sim. Deixe o valor vazio e quem pagar digita o valor no aplicativo do banco. É o formato ideal para cartazes e balcões.',
      },
      {
        question: 'O QR Code PIX gerado aqui é seguro?',
        answer:
          'Ele é gerado no seu navegador e a chave não é enviada a nenhum servidor. Confira a chave e o nome do recebedor antes de imprimir.',
      },
      {
        question: 'Qual a diferença entre QR Code PIX estático e dinâmico?',
        answer:
          'O estático, gerado aqui, pode ser usado quantas vezes quiser e não expira: serve para balcões, cartazes e cobranças de mesmo valor. O dinâmico é criado pelo banco a cada cobrança, pode ter vencimento e identifica cada pagamento, mas exige integração com o banco.',
      },
      {
        question: 'Gerar o QR Code PIX tem algum custo?',
        answer:
          'O gerador é grátis e não cobra nada por pagamento. Receber por PIX é gratuito para pessoas físicas; para empresas, a tarifa depende do contrato com o banco de quem recebe.',
      },
    ],
    guide: [
      {
        heading: 'Como funciona o QR Code PIX estático',
        paragraphs: [
          'O código guarda, em texto, a chave PIX, o nome e a cidade de quem recebe e, se você quiser, um valor e um identificador. Esse texto segue o BR Code, o padrão do Banco Central baseado no padrão EMV de pagamentos, e termina com um código de verificação (CRC16) que o aplicativo do banco confere antes de mostrar o pagamento.',
          'Por isso qualquer aplicativo de banco ou carteira que aceite PIX lê o código, sem depender deste site. O mesmo texto é o “PIX Copia e Cola”: na etapa de download dá para copiá-lo e enviar por mensagem para quem não consegue escanear.',
        ],
      },
      {
        heading: 'PIX estático ou dinâmico: qual usar',
        paragraphs: [
          'O QR Code gerado aqui é estático: pode ser impresso e usado quantas vezes for preciso, não expira e não passa por nenhum servidor. É o formato certo para balcão, cardápio, feira, doação e cobranças de mesmo valor.',
          'O dinâmico é criado pelo banco ou pela maquininha a cada cobrança. Ele aponta para um endereço do banco, pode ter vencimento, juros e desconto e identifica cada pagamento automaticamente, mas exige uma conta com integração (API PIX). Se você precisa conciliar muitas vendas por dia, use o dinâmico do seu banco; para receber de forma simples, o estático basta.',
        ],
      },
      {
        heading: 'Com valor ou sem valor',
        paragraphs: [
          'Com o valor preenchido, o aplicativo de quem paga já abre com a quantia, o que evita erro de digitação em cobranças únicas, como um pedido, uma inscrição ou uma mensalidade. Sem valor, quem paga digita a quantia: é o formato ideal para cartazes, gorjetas e doações, porque o mesmo código serve para qualquer compra.',
          'O Identificador é opcional: até 25 letras ou números, sem espaços, como “pedido123”, para ajudar a reconhecer o pagamento. Sem ele, o código usa “***”, o valor padrão do BR Code para cobranças sem identificador.',
        ],
      },
      {
        heading: 'Chave, nome e cidade: as regras do BR Code',
        paragraphs: [
          'A chave pode ser CPF, CNPJ, e-mail, celular ou chave aleatória. CPF e CNPJ vão só com os números. A chave de celular vai no formato internacional: +55, DDD e número, sem espaços nem traços (ex.: +5511999990000).',
          'O nome do recebedor tem até 25 caracteres e a cidade até 15, os limites do padrão. O gerador tira os acentos e passa tudo para maiúsculas, porque muitos aplicativos não leem acentos nesses campos: “São Paulo” vira “SAO PAULO”. Antes de confirmar, quem paga vê o nome cadastrado na chave pelo banco.',
        ],
      },
      {
        heading: 'Como imprimir uma placa de PIX para o balcão',
        paragraphs: [
          'Baixe em SVG ou PNG de 2048 px. A regra prática é 1 cm de código para cada 10 cm de distância de leitura: 3 a 5 cm para o balcão, 10 cm ou mais para uma parede. Use a moldura com um texto como “Pague com PIX” e escreva o nome do recebedor perto do código, para quem paga conferir.',
          'Mantenha o código escuro sobre fundo claro, proteja a placa com plástico ou acrílico e teste a leitura com celulares de dois bancos diferentes antes de deixar no balcão.',
        ],
      },
      {
        heading: 'Segurança: como evitar golpes com QR Code PIX',
        paragraphs: [
          'Golpistas colam QR Codes falsos por cima dos verdadeiros. Prefira placas protegidas e confira de vez em quando se o código ainda é o seu. Para quem paga: o aplicativo mostra o nome e a instituição de quem recebe antes da confirmação; se não bater com a loja, não pague.',
          'Este gerador não guarda nem envia a sua chave: o código é montado no seu navegador, e o código-fonte é aberto para qualquer pessoa conferir.',
        ],
      },
    ],
    sources: [{ label: 'Pix, no site do Banco Central', href: 'https://www.bcb.gov.br/estabilidadefinanceira/pix' }],
    related: ['whatsapp', 'link', 'wifi', 'vcard'],
  },
  email: {
    name: 'QR Code de e-mail',
    title: 'Gerador de QR Code de e-mail grátis',
    description:
      'Crie um QR Code que abre um e-mail pronto, com destinatário, assunto e mensagem preenchidos. Ideal para suporte, orçamentos e inscrições.',
    faq: [
      {
        question: 'O que acontece ao escanear um QR Code de e-mail?',
        answer:
          'O aplicativo de e-mail abre com o destinatário, o assunto e a mensagem já preenchidos. A pessoa só precisa tocar em enviar.',
      },
      {
        question: 'Funciona com Gmail e Outlook?',
        answer:
          'Sim. O código usa o formato mailto, que abre o aplicativo de e-mail definido como padrão no celular, seja Gmail, Outlook ou Mail.',
      },
      {
        question: 'O e-mail é enviado automaticamente?',
        answer:
          'Não. A mensagem abre pronta, mas só é enviada quando a pessoa toca em enviar, e ela pode editar o texto antes.',
      },
    ],
    guide: [
      {
        heading: 'Quando usar um QR Code de e-mail',
        paragraphs: [
          'Em embalagens e manuais para suporte, em cartazes de vagas para receber currículos, em pedidos de orçamento e em eventos para inscrições. O código abre o aplicativo de e-mail do aparelho com destinatário, assunto e mensagem preenchidos.',
          'Use um assunto fixo, como “Orçamento: cartaz da loja”, para saber de onde veio cada contato e filtrar as mensagens na sua caixa de entrada.',
        ],
      },
    ],
    related: ['sms', 'whatsapp', 'vcard', 'phone'],
  },
  sms: {
    name: 'QR Code de SMS',
    title: 'Gerador de QR Code de SMS grátis',
    description:
      'Crie um QR Code que abre uma mensagem SMS pronta para o número escolhido. Ótimo para inscrições, cupons e atendimento. Grátis e sem cadastro.',
    faq: [
      {
        question: 'Como funciona um QR Code de SMS?',
        answer:
          'Ao escanear, o aplicativo de mensagens abre com o número e o texto já preenchidos. O envio é feito pelo celular de quem escaneou.',
      },
      {
        question: 'SMS ou WhatsApp: qual usar?',
        answer:
          'O WhatsApp é mais comum no Brasil e permite responder com fotos e áudios, mas exige internet e o aplicativo. O SMS funciona em qualquer celular, mesmo sem internet, pela rede da operadora.',
      },
      {
        question: 'Quantos caracteres cabem numa mensagem SMS?',
        answer:
          'Até 160 caracteres sem acentos, ou 70 se houver acentos ou emojis, cabem num único SMS. Mensagens maiores são divididas em partes, e cada parte pode ser cobrada.',
      },
    ],
    guide: [
      {
        heading: 'Onde usar um QR Code de SMS',
        paragraphs: [
          'Em inscrições por palavra-chave (“envie QUERO para…”), cupons, pesquisas rápidas, atendimento e avisos em lugares onde a pessoa pode estar sem internet. O código abre o aplicativo de mensagens com o número e o texto preenchidos.',
          'O envio só acontece quando a pessoa toca em enviar e sai do plano dela, então mantenha a mensagem curta e deixe claro o que ela vai receber em troca.',
        ],
      },
    ],
    related: ['whatsapp', 'phone', 'email', 'text'],
  },
  whatsapp: {
    name: 'QR Code de WhatsApp',
    title: 'QR Code de WhatsApp grátis com mensagem',
    description:
      'Crie um QR Code que abre uma conversa no WhatsApp com sua mensagem pronta. Ideal para atendimento, cardápios e vendas. Grátis e sem cadastro.',
    faq: [
      {
        question: 'Como criar um QR Code para o WhatsApp?',
        answer:
          'Escolha o país, digite o número com DDD e, se quiser, uma mensagem inicial. Ao escanear, o WhatsApp abre a conversa com o texto pronto para enviar.',
      },
      {
        question: 'Funciona com WhatsApp Business?',
        answer: 'Sim. O link wa.me abre a conversa em qualquer conta, pessoal ou Business.',
      },
      {
        question: 'Quem escanear precisa salvar meu número?',
        answer:
          'Não. O link wa.me abre a conversa direto, sem salvar o contato. A pessoa vê o seu número e, se você escreveu uma mensagem, o texto pronto para enviar.',
      },
      {
        question: 'O que acontece se eu trocar de número?',
        answer:
          'O código continua abrindo o número antigo, porque ele fica gravado no QR Code. Gere e imprima um código novo com o número atual.',
      },
    ],
    guide: [
      {
        heading: 'Como funciona o link wa.me',
        paragraphs: [
          'O QR Code guarda um link no formato wa.me/55DDDNÚMERO, o endereço oficial do WhatsApp para abrir uma conversa. Se você escrever uma mensagem inicial, ela entra no link e aparece pronta para enviar. Ao preencher o número, o link aparece abaixo do formulário: copie para usar na bio do Instagram, no site ou em anúncios.',
        ],
      },
      {
        heading: 'Onde usar o QR Code de WhatsApp',
        paragraphs: [
          'Em cardápios e pedidos de delivery, vitrines, cartões, embalagens e anúncios impressos. Uma mensagem como “Olá, vi o cartaz da loja e quero um orçamento” mostra de onde veio cada cliente.',
        ],
      },
    ],
    related: ['pix', 'phone', 'sms', 'social'],
  },
  phone: {
    name: 'QR Code de telefone',
    title: 'Gerador de QR Code de telefone grátis',
    description:
      'Crie um QR Code que liga para o seu número com um toque. Útil em cartazes, veículos e embalagens. Grátis, com moldura e logo.',
    faq: [
      {
        question: 'O QR Code de telefone liga sozinho?',
        answer: 'Não. Ele abre o discador com o número preenchido e a pessoa confirma a chamada.',
      },
      {
        question: 'Preciso de internet para ligar pelo QR Code?',
        answer:
          'Não. O código só abre o discador com o número; a ligação usa a rede da operadora, como qualquer chamada.',
      },
      {
        question: 'Em que formato o número fica gravado?',
        answer:
          'No formato internacional: o código do país, o DDD e o número, como +5511999990000. Assim a ligação funciona também para quem escaneia com um chip de outro país.',
      },
    ],
    guide: [
      {
        heading: 'Onde usar um QR Code de telefone',
        paragraphs: [
          'Em cartazes de serviço, adesivos em veículos, embalagens, placas de imóveis e cardápios de delivery. Ao escanear, o celular abre o discador com o número preenchido e a pessoa só confirma a ligação, sem risco de digitar errado.',
          'Para atendimento por mensagem, prefira o QR Code de WhatsApp; para salvar o número na agenda, o de contato (vCard).',
        ],
      },
    ],
    related: ['whatsapp', 'sms', 'vcard', 'geo'],
  },
  geo: {
    name: 'QR Code de localização',
    title: 'QR Code de localização no mapa grátis',
    description:
      'Crie um QR Code que abre um ponto exato no mapa a partir da latitude e longitude. Ideal para eventos, lojas e entregas. Grátis e sem cadastro.',
    faq: [
      {
        question: 'Como pego a latitude e longitude de um lugar?',
        answer:
          'No Google Maps, toque e segure no ponto do mapa: as coordenadas aparecem na busca. Cole os dois números nos campos do gerador.',
      },
      {
        question: 'Por que usar coordenadas em vez do endereço?',
        answer:
          'Coordenadas levam ao ponto exato: o portão certo, a vaga do food truck ou um local sem número. Endereços podem cair na entrada errada ou não existir no mapa.',
      },
      {
        question: 'Em qual aplicativo de mapas o local abre?',
        answer:
          'O código abre um link do Google Maps, no aplicativo quando ele está instalado ou no navegador. De lá a pessoa traça a rota ou compartilha o ponto com outro aplicativo.',
      },
    ],
    guide: [
      {
        heading: 'Onde usar o QR Code de localização',
        paragraphs: [
          'Em convites de casamento e festas, eventos ao ar livre, entradas de condomínio, lojas em galerias, pontos de coleta e entregas em endereços difíceis de achar. Quem escaneia vê o ponto no mapa e já pode traçar a rota.',
        ],
      },
      {
        heading: 'Como pegar as coordenadas',
        paragraphs: [
          'No Google Maps do celular, toque e segure no ponto até aparecer um alfinete; as coordenadas surgem na busca, como -23.55052, -46.633308. O primeiro número é a latitude e o segundo, a longitude. No computador, clique com o botão direito no ponto e clique nas coordenadas para copiar.',
        ],
      },
    ],
    related: ['event', 'link', 'phone', 'wifi'],
  },
  event: {
    name: 'QR Code de evento',
    title: 'QR Code de evento para a agenda grátis',
    description:
      'Crie um QR Code que adiciona seu evento à agenda com título, local, data e hora. Ideal para convites, palestras e inaugurações. Grátis.',
    faq: [
      {
        question: 'O QR Code de evento funciona no Google Agenda e no iPhone?',
        answer:
          'Sim. O código usa o formato iCalendar, que o Google Agenda, o Calendário do iPhone e o Outlook reconhecem.',
      },
      {
        question: 'Posso mudar a data depois de imprimir?',
        answer:
          'Não. Os dados do evento ficam gravados no código. Se a data, o horário ou o local mudarem, gere e imprima um código novo.',
      },
      {
        question: 'Preciso informar o horário de término?',
        answer:
          'Não. Sem término, o compromisso é salvo só com o horário de início. Informe o fim quando quiser que a agenda reserve o tempo todo do evento.',
      },
    ],
    guide: [
      {
        heading: 'Onde usar o QR Code de evento',
        paragraphs: [
          'Em convites, cartazes de palestra, inaugurações, cursos, reuniões de condomínio e prazos de entrega. Ao escanear, o celular oferece adicionar o compromisso à agenda com título, local, início, fim e descrição, e o lembrete vem do próprio calendário.',
        ],
      },
      {
        heading: 'Fuso horário',
        paragraphs: [
          'O horário é salvo sem fuso, então cada celular o interpreta no fuso em que está. Para eventos presenciais isso é o esperado; para eventos online com público de outros países, escreva o fuso na descrição, como “20h, horário de Brasília”.',
        ],
      },
    ],
    related: ['geo', 'link', 'vcard', 'text'],
  },
};

/** The three steps of the wizard, shared by every type's HowTo. */
export function howToSteps(name: string) {
  return [
    { name: 'Escolha o tipo', text: `Selecione ${name} na lista de tipos.` },
    { name: 'Adicione o conteúdo', text: 'Preencha os campos e confira na prévia o que aparece para quem escanear.' },
    {
      name: 'Personalize e baixe',
      text: 'Escolha moldura, cores, formato e logo, confira a leitura e baixe em PNG, SVG ou JPEG.',
    },
  ];
}
