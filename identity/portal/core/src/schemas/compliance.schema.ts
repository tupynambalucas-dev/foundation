import { z } from 'zod';

export const ComplianceSectionSchema = z.object({
  id: z.string().min(1),
  number: z.string().min(1),
  title: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
});
export type IComplianceSection = z.infer<typeof ComplianceSectionSchema>;

export const ComplianceDocumentSchema = z.object({
  title: z.string().min(1),
  lastUpdated: z.string().min(1),
  organization: z.string().min(1),
  canonicalUrl: z.url(),
  contactEmail: z.email(),
  sections: z.array(ComplianceSectionSchema).min(1),
});
export type IComplianceDocument = z.infer<typeof ComplianceDocumentSchema>;

export const PRIVACY_CONTENT: IComplianceDocument = ComplianceDocumentSchema.parse({
  title: 'Política de Privacidade e Proteção de Dados',
  lastUpdated: '28 de Novembro de 2026',
  organization: 'tupynambalucas-dev',
  canonicalUrl: 'https://apps.tupynambalucas.dev/privacy',
  contactEmail: 'privacy@tupynambalucas.dev',
  sections: [
    {
      id: 'compromisso',
      number: '1',
      title: 'Compromisso com a Privacidade e Segurança',
      paragraphs: [
        'A organização tupynambalucas-dev está comprometida em resguardar a privacidade, a integridade dos dados e a segurança das informações de todos os usuários, clientes e sistemas que interagem com nossos softwares, bibliotecas e integrações de nuvem.',
        'Esta Política de Privacidade estabelece as diretrizes de governança e tratamento de dados observadas em todas as aplicações mantidas pela organização — incluindo o aplicativo Google Cloud central tupynambalucas-org-workspace (Rclone Desktop Client e automações Workspace/AppSheet) e os GitHub Apps organizacionais — em total conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018), o GDPR (Regulamento UE 2016/679) e a Google API Services User Data Policy.',
      ],
    },
    {
      id: 'coleta-dados',
      number: '2',
      title: 'Dados Coletados e Finalidade do Tratamento',
      paragraphs: [
        'Nossos aplicativos operam sob o Princípio do Menor Privilégio (PoLP) e Coleta Mínima Necessária:',
        '• tupynambalucas-org-workspace (Rclone Desktop Client & CLI): Os tokens de autorização OAuth 2.0 são armazenados exclusivamente na máquina local do próprio usuário (em rclone.conf protegido ou no cofre do sistema operacional). Nossos servidores remotos nunca recebem, interceptam nem armazenam seus tokens de acesso ou arquivos sincronizados.',
        '• tupynambalucas-org-workspace (Google Workspace / AppSheet Automation): Planilhas e documentos trafegam exclusivamente entre os serviços autorizados (Google Drive, Sheets e Docs) via Service Account dedicada. Não realizamos retenção paralela de dados de negócio.',
        '• GitHub Apps Organizacionais (org-manager, org-automation, org-guardian, developer-tools): O Token Broker processa apenas identidades de máquina e emite tokens efêmeros de 1 hora com escopo delimitado aos repositórios autorizados em policies.yaml.',
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
        '• Armazenamento de segredos em cofre corporativo (Infisical Cloud) com autenticação Universal Auth.',
      ],
    },
    {
      id: 'direitos-titular',
      number: '5',
      title: 'Direitos dos Titulares e Revogação de Acesso',
      paragraphs: [
        'Você possui o direito de confirmar a existência de tratamento, acessar seus dados, revogar o consentimento a qualquer momento diretamente em https://myaccount.google.com/permissions ou nas configurações de segurança da sua conta GitHub, e solicitar a exclusão de qualquer informação.',
        'Para esclarecimentos ou solicitações relacionadas a esta política, entre em contato através de: privacy@tupynambalucas.dev ou abra uma solicitação em nosso repositório de governança no GitHub.',
      ],
    },
  ],
});

export const TERMS_CONTENT: IComplianceDocument = ComplianceDocumentSchema.parse({
  title: 'Termos de Serviço para Aplicações e APIs',
  lastUpdated: '28 de Novembro de 2026',
  organization: 'tupynambalucas-dev',
  canonicalUrl: 'https://apps.tupynambalucas.dev/terms',
  contactEmail: 'legal@tupynambalucas.dev',
  sections: [
    {
      id: 'aceitacao',
      number: '1',
      title: 'Aceitação dos Termos',
      paragraphs: [
        'Ao utilizar qualquer aplicação, ferramenta de linha de comando, biblioteca de software ou integração mantida pela organização tupynambalucas-dev (incluindo tupynambalucas-org-workspace e os GitHub Apps organizacionais), você concorda expressamente com os presentes Termos de Serviço.',
        'Caso você não concorde com qualquer disposição aqui estabelecida, solicitamos que descontinue imediatamente o uso de nossos softwares e revogue os acessos concedidos nas plataformas parceiras (Google e GitHub).',
      ],
    },
    {
      id: 'uso-autorizado',
      number: '2',
      title: 'Uso Autorizado e Responsabilidades',
      paragraphs: [
        'Nossas soluções de software e identidades de máquina são disponibilizadas para finalidades legítimas de automação, engenharia de software, backup profissional e sincronização de dados.',
        'É estritamente proibido utilizar nossas ferramentas para: (a) violar leis ou regulamentos aplicáveis; (b) tentar burlar limites de taxa ou controles de acesso de provedores terceiros; (c) transferir malware ou executar ações que degradem a infraestrutura de rede.',
      ],
    },
    {
      id: 'propriedade-licenciamento',
      number: '3',
      title: 'Propriedade Intelectual e Licenciamento',
      paragraphs: [
        'Os códigos-fonte dos softwares da organização tupynambalucas-dev são distribuídos sob licenças de código aberto padrão da indústria (predominantemente Apache License 2.0).',
        'As marcas registradas, nomes de domínio e identidades visuais pertencem exclusivamente à organização tupynambalucas-dev.',
      ],
    },
    {
      id: 'garantias-limitacao',
      number: '4',
      title: 'Isenção de Garantias e Limitação de Responsabilidade',
      paragraphs: [
        'Os softwares são fornecidos no estado em que se encontram ("as is"), sem garantias explícitas ou implícitas de adequação a uma finalidade específica.',
        'Em nenhuma circunstância a organização tupynambalucas-dev será responsável por eventuais danos indiretos, perda de dados ou lucros cessantes decorrentes da utilização incorreta ou interrupção de serviços de provedores de nuvem terceiros (Google, GitHub ou Cloudflare).',
      ],
    },
    {
      id: 'alteracoes-contato',
      number: '5',
      title: 'Alterações destes Termos e Contato',
      paragraphs: [
        'Reservamo-nos o direito de atualizar estes termos periodicamente para refletir alterações regulatórias ou lançamentos de novas funcionalidades. A versão vigente sempre estará publicada em https://apps.tupynambalucas.dev/terms.',
        'Contato de conformidade: legal@tupynambalucas.dev.',
      ],
    },
  ],
});
