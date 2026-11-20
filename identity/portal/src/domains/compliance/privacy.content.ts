export const PRIVACY_CONTENT = {
  title: 'Política de Privacidade e Proteção de Dados',
  lastUpdated: '20 de Novembro de 2026',
  organization: 'tupynambalucas-dev',
  sections: [
    {
      id: 'compromisso',
      number: '1',
      title: 'Compromisso com a Privacidade e Segurança',
      paragraphs: [
        'A organização tupynambalucas-dev está comprometida em resguardar a privacidade, a integridade dos dados e a segurança das informações de todos os usuários, clientes e sistemas que interagem com nossos softwares, bibliotecas e integrações de nuvem.',
        'Esta Política de Privacidade estabelece as diretrizes de governança e tratamento de dados observadas em todas as aplicações mantidas pela organização, em total conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018), o Regulamento Geral sobre a Proteção de Dados da União Europeia (GDPR - Regulamento UE 2016/679) e a Política de Dados de Usuário dos Serviços de API do Google (Google API Services User Data Policy).',
      ],
    },
    {
      id: 'coleta-dados',
      number: '2',
      title: 'Dados Coletados e Finalidade do Tratamento',
      paragraphs: [
        'Nossos aplicativos operam sob o Princípio do Menor Privilégio (PoLP) e Coleta Mínima Necessária:',
        '• Aplicativos Desktop e Ferramentas CLI (ex: Rclone Desktop Client): Os tokens de autorização OAuth 2.0 são armazenados exclusivamente na máquina local do próprio usuário (em rclone.conf protegido ou no cofre do sistema operacional). Nossos servidores remotos nunca recebem, interceptam nem armazenam seus tokens de acesso ou arquivos sincronizados.',
        '• Integrações de Nuvem e Automações (Google Workspace / AppSheet): Dados tabulares trafegam exclusivamente entre os serviços autorizados pelo usuário (Google Sheets e APIs do Google). Não realizamos retenção paralela de dados de negócio.',
        '• GitHub Apps e Token Broker: O Token Broker processa apenas identidades de agentes e emite tokens efêmeros de 1 hora com escopo delimitado aos repositórios autorizados em policies.yaml.',
      ],
    },
    {
      id: 'google-compliance',
      number: '3',
      title: 'Conformidade com a Política de Dados de Usuário do Google',
      paragraphs: [
        'O uso e a transferência de informações recebidas das APIs do Google para qualquer outro aplicativo por parte de nossos softwares aderem estritamente à Política de Dados de Usuário dos Serviços de API do Google, incluindo os Requisitos de Uso Limitado (Limited Use Requirements):',
        '1. Não utilizamos dados obtidos via APIs do Google para desenvolver, treinar ou aprimorar modelos de Inteligência Artificial generativa generalistas sem consentimento explícito.',
        '2. Nenhum ser humano lê seus arquivos ou metadados, exceto quando necessário para suporte mediante autorização formal ou quando exigido por lei.',
        '3. Não vendemos nem compartilhamos dados de usuários com redes de anúncios ou corretores de dados.',
      ],
    },
    {
      id: 'seguranca-retencao',
      number: '4',
      title: 'Segurança da Informação e Retenção',
      paragraphs: [
        'Implementamos medidas de segurança técnicas e organizacionais avançadas:',
        '• Criptografia em trânsito com TLS 1.3 obrigatório e HSTS com preload em todos os domínios corporativos (*.tupynambalucas.dev).',
        '• Cabeçalhos de proteção estritos (X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy).',
        '• Armazenamento de segredos em cofre corporativo (Infisical) com autenticação Universal Auth.',
      ],
    },
    {
      id: 'direitos-titular',
      number: '5',
      title: 'Direitos dos Titulares e Contato',
      paragraphs: [
        'Você possui o direito de confirmar a existência de tratamento, acessar seus dados, revogar o consentimento a qualquer momento (diretamente nas configurações de segurança da sua conta Google ou GitHub) e solicitar a exclusão de qualquer informação.',
        'Para esclarecimentos ou solicitações relacionadas a esta política, entre em contato através de: privacy@tupynambalucas.dev ou abra uma solicitação em nosso repositório de governança no GitHub.',
      ],
    },
  ],
};
