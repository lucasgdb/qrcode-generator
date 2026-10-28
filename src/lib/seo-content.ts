// Search and answer-engine copy (pt-BR). Every FAQ here is also shown on its page:
// Google only uses FAQ structured data that matches visible content.

import type { QrTypeId } from './types';

export interface Faq {
  question: string;
  answer: string;
}

export interface TypeSeo {
  /** The <title> before the site name; keep it under ~60 characters with the suffix. */
  title: string;
  /** Meta description: what the page does, in under ~155 characters. */
  description: string;
  /** Short phrase used in headings, alt text and llms.txt ("QR Code de Wi-Fi"). */
  name: string;
  faq: Faq[];
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
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
