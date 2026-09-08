import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const pt = {
  common: {
    loading: "Carregando...", save: "Guardar", cancel: "Cancelar", edit: "Editar", delete: "Eliminar"
  },
  navigation: {
    home: "Início", dashboard: "Painel de Controlo", organizations: "Organizações", clubs: "Clubes", players: "Jogadores", competitions: "Competições"
  },
  nav: {
    main: "Navegação principal"
  },
  footer: {
    product: "Produto", features: "Funcionalidades", pricing: "Preços", docs: "Documentação", roadmap: "Roadmap", company: "Empresa", about: "Sobre Nós", blog: "Blog", contact: "Contacto", careers: "Carreiras", legal: "Legal", privacy: "Privacidade", terms: "Termos de Serviço", cookies: "Cookies", security: "Segurança", status: "Estado do Sistema", support: "Suporte", social: { github: "GitHub", twitter: "Twitter", website: "Website" }
  },
  auth: {
    login: {
      registerTitle: "Criar Conta", title: "Entrar", email: "Email", password: "Palavra-passe", submitLoginLoading: "A entrar...", submitLogin: "Entrar", firstName: "Nome", lastName: "Apelido", phone: "Telefone", confirmPassword: "Confirmar Palavra-passe", submitRegisterLoading: "A registar...", submitRegister: "Registar", hasAccount: "Já tem conta?", noAccount: "Não tem conta?", loginLink: "Entre aqui", registerLink: "Registe-se", forgotPassword: "Esqueceu-se da palavra-passe?", organizationCta: "É uma organização?", organizationLink: "Registe a sua organização"
    }
  },
  dashboard: {
    sidebar: { logout: "Sair", settings: "Definições", support: "Suporte" },
    sublabels: { federation: "Federação", executive: "Executivo", league: "Liga", club: "Clube", competition: "Competição", player: "Jogador", default: "Painel", organization: "Organização" }
  },
  landing: {
    hero: {
      badge: "O ECOSSISTEMA DO DESPORTO NACIONAL", titlePrefix: "A REVOLUÇÃO DO ", titleHighlight: "DESPORTO", description: "Gere clubes, atletas, competições e finanças num único ecossistema. De Angola para o mundo.", ctaStart: "Começar Agora", ctaDemo: "Ver Demonstração"
    },
    howItWorks: {
      title: "Como Funciona", steps: [ { title: "Registo", description: "Crie a sua conta de organização." }, { title: "Gestão", description: "Gira clubes, jogadores e competições." }, { title: "Análise", description: "Acompanhe estatísticas em tempo real." } ]
    },
    features: {
      title: "Funcionalidades Principais", subtitle: "Tudo o que precisa para gerir desporto com excelência.", items: [ { title: "Gestão de Competições", description: "Crie e gira torneios de forma automatizada." }, { title: "Passaportes Desportivos", description: "Registo único de atletas e transferências." }, { title: "Relatórios Financeiros", description: "Controlo total de receitas e despesas." } ]
    },
    ecosystem: {
      title: "O Nosso Ecossistema", subtitle: "Conectamos todos os intervenientes do desporto.", items: [ { title: "Clubes", description: "Ferramentas completas de gestão de plantéis." }, { title: "Atletas", description: "Perfil profissional e métricas de desempenho." }, { title: "Fãs", description: "Acompanhamento em direto e interatividade." } ]
    },
    pricing: {
      title: "Planos e Preços", subtitle: "Escolha o plano ideal para a sua estrutura.", ctaStart: "Começar Grátis", ctaContact: "Contactar Vendas", plans: [ { name: "Básico", price: "Grátis", features: ["Até 50 atletas", "1 Competição"], recommended: false }, { name: "Pro", price: "Kz 50.000/mês", features: ["Atletas ilimitados", "Competições ilimitadas", "Suporte 24/7"], recommended: true } ]
    },
    stats: {
      heading: "Impacto em Números", items: [ { label: "Atletas" }, { label: "Clubes" }, { label: "Competições" }, { label: "Golos" } ]
    },
    testimonials: {
      title: "Testemunhos", subtitle: "O que dizem os nossos parceiros.", items: [ { content: "A plataforma revolucionou a forma como gerimos o nosso clube.", author: "João Silva", role: "Presidente" }, { content: "Finalmente temos uma ferramenta à altura do desporto nacional.", author: "Maria Santos", role: "Diretora Técnica" } ]
    },
    trustedBy: { label: "Com a confiança de" },
    faq: {
      title: "Perguntas Frequentes", items: [ { question: "Como posso registar a minha organização?", answer: "Aceda à página de registo e preencha o formulário." }, { question: "Quais os custos associados?", answer: "O registo base é gratuito. Consulte os nossos planos para mais funcionalidades." } ]
    },
    demo: { title: "Demonstração", close: "Fechar", placeholder: "Insira os seus dados..." },
    skipToContent: "Saltar para o conteúdo"
  },
  players: {
    achievements: {
      section: { addTitle: "Adicionar Conquista", title: "Conquistas", type: "Tipo", level: "Nível", dateAchieved: "Data", season: "Época", description: "Descrição", trophyImageUrl: "URL do Troféu", certificateUrl: "URL do Certificado", trophyImage: "Imagem do Troféu", trophyImageHint: "Opcional", certificateFile: "Ficheiro do Certificado", certificateFileHint: "Opcional", sourceHint: "Opcional", save: "Guardar", loading: "A carregar...", emptyTitle: "Sem conquistas", emptyDescription: "Nenhuma conquista registada." },
      emptyTitle: "Sem conquistas", emptyDescription: "Nenhuma conquista registada."
    },
    common: { verified: "Verificado", noDescription: "Sem descrição", delete: "Eliminar", present: "Presente", goalsShort: "G", assistsShort: "A", matchesShort: "J", private: "Privado", watch: "Ver", featured: "Destaque", back: "Voltar", cancel: "Cancelar" },
    avatar: { alt: "Avatar" },
    card: { stats: "Estatísticas", goals: "Golos", assists: "Assistências", matches: "Jogos", view_profile: "Ver Perfil" },
    career: { emptyTitle: "Sem histórico", emptyDescription: "Nenhum histórico registado." },
    documents: {
      section: { addTitle: "Adicionar Documento", title: "Documentos", category: "Categoria", description: "Descrição", validFrom: "Válido de", validUntil: "Válido até", file: "Ficheiro", privateLabel: "Privado", save: "Guardar", loading: "A carregar...", emptyTitle: "Sem documentos", emptyDescription: "Nenhum documento registado." },
      openFile: "Abrir ficheiro", emptyTitle: "Sem documentos", emptyDescription: "Nenhum documento registado.", clubLabel: "Clube", validFrom: "Válido de", validUntil: "Válido até"
    },
    detail: { stats: { goals: "Golos", assists: "Assistências", matches: "Jogos", position: "Posição" }, tabs: { career: "Carreira", videos: "Vídeos", achievements: "Conquistas", documents: "Documentos" }, careerHistory: "Histórico de Carreira" },
    videos: {
      section: { addTitle: "Adicionar Vídeo", title: "Vídeos", type: "Tipo", description: "Descrição", videoUrl: "URL do Vídeo", thumbnailUrl: "URL da Miniatura", file: "Ficheiro", order: "Ordem", sourceHint: "Opcional", featuredLabel: "Destaque", save: "Guardar", loading: "A carregar...", emptyTitle: "Sem vídeos", emptyDescription: "Nenhum vídeo registado.", publish: "Publicar" },
      emptyTitle: "Sem vídeos", emptyDescription: "Nenhum vídeo registado."
    },
    register: { error: "Erro", title: "Registo de Jogador", loading: "A carregar...", subtitle: "Insira os dados do jogador.", clubErrorTitle: "Erro no clube", loadErrorDescription: "Não foi possível carregar os dados.", noClubTitle: "Sem clube", noClubDescription: "O jogador não pertence a nenhum clube.", titleFull: "Registo Completo", stepSelect: "Selecionar Passo", consentDescription: "Autorizo o tratamento dos dados.", searchPlaceholder: "Pesquisar jogador...", playersErrorTitle: "Erro nos jogadores", emptyTitle: "Sem jogadores", emptyDescription: "Nenhum jogador encontrado.", alreadyInThisClub: "Já pertence a este clube.", alreadyHasClub: "Já pertence a um clube.", nationalityUnknown: "Nacionalidade desconhecida", selectPlayerHint: "Selecione um jogador", selectedPlayer: "Jogador selecionado", stepDetails: "Detalhes", club: "Clube", joinedDate: "Data de Entrada", shirtNumber: "Número da Camisola", competitionId: "Competição", noCompetition: "Sem competição", retryCompetitions: "Tentar novamente", submit: "Submeter" },
    linkRequest: { status: { approved: "Aprovado", rejected: "Rejeitado", pending: "Pendente", invited: "Convidado" }, title: "Pedido de Ligação", subtitle: "Ligue-se a um clube", loadErrorTitle: "Erro a carregar", loadErrorDescription: "Não foi possível carregar os dados.", alreadyLinkedTitle: "Já ligado", selectClub: "Selecionar Clube", searchClubPlaceholder: "Pesquisar clube...", clubsErrorTitle: "Erro nos clubes", noClubsTitle: "Sem clubes", noClubsDescription: "Nenhum clube encontrado.", detailsTitle: "Detalhes", loading: "A carregar...", noCompetition: "Sem competição", summaryTitle: "Resumo", summaryDescription: "Confirme os dados antes de submeter.", summaryClub: "Clube", summaryCompetition: "Competição", submit: "Submeter", myRequestsTitle: "Os Meus Pedidos", requestsErrorTitle: "Erro nos pedidos", noRequestsTitle: "Sem pedidos", noRequestsDescription: "Nenhum pedido efetuado.", lastUpdated: "Última atualização", accept: "Aceitar", viewClub: "Ver clube" },
    clubRequests: { columns: { player: "Jogador", submittedBy: "Submetido por", status: "Estado", date: "Data", actions: "Ações" }, approve: "Aprovar", reject: "Rejeitar", notesLabel: "Notas", rejectionReasonLabel: "Motivo de rejeição", notesPlaceholder: "Insira notas...", confirmApprove: "Confirmar Aprovação", confirmReject: "Confirmar Rejeição", title: "Pedidos do Clube", subtitle: "Gerir pedidos de jogadores", clubErrorTitle: "Erro no clube", loadErrorDescription: "Não foi possível carregar os dados.", loadErrorTitle: "Erro a carregar", emptyTitle: "Sem pedidos", emptyDescription: "Nenhum pedido pendente.", filterLabel: "Filtrar por", filters: { pending: "Pendente", all: "Todos", approved: "Aprovado", rejected: "Rejeitado" }, filteredEmpty: "Sem resultados para o filtro." },
    create: { title: "Criar Jogador", subtitle: "Adicione um novo jogador.", back: "Voltar" },
    form: { personalInfo: "Informação Pessoal", firstName: "Nome", lastName: "Apelido", dateOfBirth: "Data de Nascimento", nationality: "Nacionalidade", footballInfo: "Informação Desportiva", primaryPosition: "Posição Principal", selectPosition: "Selecionar Posição", foot: "Pé Preferencial", select: "Selecionar", footLeft: "Esquerdo", footRight: "Direito", footBoth: "Ambos", avatarUrl: "URL do Avatar", physicalInfo: "Informação Física", height: "Altura (cm)", weight: "Peso (kg)", bio: "Biografia", create: "Criar", verifyHint: "Verifique os dados", clear: "Limpar", creating: "A criar...", createError: "Erro a criar", publicProfile: "Perfil Público", publicProfileHint: "Tornar o perfil visível publicamente", saving: "A guardar...", save: "Guardar", status: "Estado", avatarUrlAlt: "Avatar", avatarAutoPlaceholder: "Automático", updateError: "Erro ao atualizar" },
    dashboard: { settingsLoading: "A carregar...", subtitle: "Bem-vindo ao painel do jogador.", notFoundTitle: "Não encontrado", notFoundDescription: "A página solicitada não existe.", explorePlayers: "Explorar Jogadores", title: "Painel do Jogador", loading: "A carregar...", subtitleActive: "Ativo", editProfile: "Editar Perfil", currentClub: "Clube Atual", publicProfile: "Perfil Público", stats: { matches: "Jogos", goals: "Golos", assists: "Assistências", achievements: "Conquistas" }, recentDocuments: "Documentos Recentes", settingsTitle: "Definições", settingsNotFoundTitle: "Definições não encontradas", settingsNotFoundDescription: "Não foi possível carregar as definições.", settingsSubtitle: "Gerir as suas preferências." },
    settings: { tabs: { profile: "Perfil", documents: "Documentos", videos: "Vídeos", achievements: "Conquistas" }, loading: "A carregar...", notFoundTitle: "Não encontrado", notFoundDescription: "A página não existe.", backToList: "Voltar à lista", backToProfile: "Voltar ao perfil", editDescription: "Editar as informações do perfil." },
    list: { badge: "Jogadores", title: "Descubra Talentos", subtitle: "Explore a base de dados de jogadores.", discoveryDescription: "Encontre os melhores jogadores de Angola e do Mundo.", searchPlaceholder: "Pesquisar jogadores...", filters: "Filtros", position: "Posição", allPositions: "Todas as Posições", nationality: "Nacionalidade", nationalityPlaceholder: "Todas as Nacionalidades", availability: "Disponibilidade", allPlayers: "Todos os Jogadores", onlyAvailable: "Apenas Disponíveis", clearFilters: "Limpar Filtros", loadErrorTitle: "Erro a carregar", loadErrorMessage: "Não foi possível carregar os jogadores.", previous: "Anterior", page: "Página", next: "Seguinte" }
  }
};

const en = {
  common: {
    loading: "Loading...", save: "Save", cancel: "Cancel", edit: "Edit", delete: "Delete"
  },
  navigation: {
    home: "Home", dashboard: "Dashboard", organizations: "Organizations", clubs: "Clubs", players: "Players", competitions: "Competitions"
  },
  nav: {
    main: "Main navigation"
  },
  footer: {
    product: "Product", features: "Features", pricing: "Pricing", docs: "Documentation", roadmap: "Roadmap", company: "Company", about: "About Us", blog: "Blog", contact: "Contact", careers: "Careers", legal: "Legal", privacy: "Privacy Policy", terms: "Terms of Service", cookies: "Cookies", security: "Security", status: "System Status", support: "Support", social: { github: "GitHub", twitter: "Twitter", website: "Website" }
  },
  auth: {
    login: {
      registerTitle: "Create Account", title: "Login", email: "Email", password: "Password", submitLoginLoading: "Logging in...", submitLogin: "Login", firstName: "First Name", lastName: "Last Name", phone: "Phone", confirmPassword: "Confirm Password", submitRegisterLoading: "Registering...", submitRegister: "Register", hasAccount: "Already have an account?", noAccount: "Don't have an account?", loginLink: "Login here", registerLink: "Register", forgotPassword: "Forgot password?", organizationCta: "Are you an organization?", organizationLink: "Register your organization"
    }
  },
  dashboard: {
    sidebar: { logout: "Logout", settings: "Settings", support: "Support" },
    sublabels: { federation: "Federation", executive: "Executive", league: "League", club: "Club", competition: "Competition", player: "Player", default: "Dashboard", organization: "Organization" }
  },
  landing: {
    hero: {
      badge: "THE NATIONAL SPORTS ECOSYSTEM", titlePrefix: "THE REVOLUTION OF ", titleHighlight: "SPORTS", description: "Manage clubs, athletes, competitions, and finances in a single ecosystem. From Angola to the world.", ctaStart: "Get Started", ctaDemo: "View Demo"
    },
    howItWorks: {
      title: "How It Works", steps: [ { title: "Registration", description: "Create your organization account." }, { title: "Management", description: "Manage clubs, players, and competitions." }, { title: "Analysis", description: "Track real-time statistics." } ]
    },
    features: {
      title: "Core Features", subtitle: "Everything you need for excellent sports management.", items: [ { title: "Competition Management", description: "Create and manage tournaments automatically." }, { title: "Sports Passports", description: "Unique athlete registration and transfers." }, { title: "Financial Reports", description: "Total control over revenues and expenses." } ]
    },
    ecosystem: {
      title: "Our Ecosystem", subtitle: "We connect all sports stakeholders.", items: [ { title: "Clubs", description: "Complete squad management tools." }, { title: "Athletes", description: "Professional profile and performance metrics." }, { title: "Fans", description: "Live tracking and interactivity." } ]
    },
    pricing: {
      title: "Plans & Pricing", subtitle: "Choose the right plan for your structure.", ctaStart: "Start for Free", ctaContact: "Contact Sales", plans: [ { name: "Basic", price: "Free", features: ["Up to 50 athletes", "1 Competition"], recommended: false }, { name: "Pro", price: "Kz 50,000/month", features: ["Unlimited athletes", "Unlimited competitions", "24/7 Support"], recommended: true } ]
    },
    stats: {
      heading: "Impact in Numbers", items: [ { label: "Athletes" }, { label: "Clubs" }, { label: "Competitions" }, { label: "Goals" } ]
    },
    testimonials: {
      title: "Testimonials", subtitle: "What our partners say.", items: [ { content: "The platform revolutionized how we manage our club.", author: "João Silva", role: "President" }, { content: "Finally a tool that matches national sports.", author: "Maria Santos", role: "Technical Director" } ]
    },
    trustedBy: { label: "Trusted by" },
    faq: {
      title: "Frequently Asked Questions", items: [ { question: "How can I register my organization?", answer: "Go to the registration page and fill out the form." }, { question: "What are the costs?", answer: "Basic registration is free. Check our plans for more features." } ]
    },
    demo: { title: "Demo", close: "Close", placeholder: "Enter your details..." },
    skipToContent: "Skip to content"
  },
  players: {
    achievements: {
      section: { addTitle: "Add Achievement", title: "Achievements", type: "Type", level: "Level", dateAchieved: "Date", season: "Season", description: "Description", trophyImageUrl: "Trophy URL", certificateUrl: "Certificate URL", trophyImage: "Trophy Image", trophyImageHint: "Optional", certificateFile: "Certificate File", certificateFileHint: "Optional", sourceHint: "Optional", save: "Save", loading: "Loading...", emptyTitle: "No achievements", emptyDescription: "No achievements recorded." },
      emptyTitle: "No achievements", emptyDescription: "No achievements recorded."
    },
    common: { verified: "Verified", noDescription: "No description", delete: "Delete", present: "Present", goalsShort: "G", assistsShort: "A", matchesShort: "M", private: "Private", watch: "Watch", featured: "Featured", back: "Back", cancel: "Cancel" },
    avatar: { alt: "Avatar" },
    card: { stats: "Stats", goals: "Goals", assists: "Assists", matches: "Matches", view_profile: "View Profile" },
    career: { emptyTitle: "No history", emptyDescription: "No history recorded." },
    documents: {
      section: { addTitle: "Add Document", title: "Documents", category: "Category", description: "Description", validFrom: "Valid from", validUntil: "Valid until", file: "File", privateLabel: "Private", save: "Save", loading: "Loading...", emptyTitle: "No documents", emptyDescription: "No documents recorded." },
      openFile: "Open file", emptyTitle: "No documents", emptyDescription: "No documents recorded.", clubLabel: "Club", validFrom: "Valid from", validUntil: "Valid until"
    },
    detail: { stats: { goals: "Goals", assists: "Assists", matches: "Matches", position: "Position" }, tabs: { career: "Career", videos: "Videos", achievements: "Achievements", documents: "Documents" }, careerHistory: "Career History" },
    videos: {
      section: { addTitle: "Add Video", title: "Videos", type: "Type", description: "Description", videoUrl: "Video URL", thumbnailUrl: "Thumbnail URL", file: "File", order: "Order", sourceHint: "Optional", featuredLabel: "Featured", save: "Save", loading: "Loading...", emptyTitle: "No videos", emptyDescription: "No videos recorded.", publish: "Publish" },
      emptyTitle: "No videos", emptyDescription: "No videos recorded."
    },
    register: { error: "Error", title: "Player Registration", loading: "Loading...", subtitle: "Enter player details.", clubErrorTitle: "Club Error", loadErrorDescription: "Could not load data.", noClubTitle: "No Club", noClubDescription: "The player does not belong to any club.", titleFull: "Full Registration", stepSelect: "Select Step", consentDescription: "I authorize data processing.", searchPlaceholder: "Search player...", playersErrorTitle: "Players Error", emptyTitle: "No players", emptyDescription: "No players found.", alreadyInThisClub: "Already in this club.", alreadyHasClub: "Already has a club.", nationalityUnknown: "Unknown nationality", selectPlayerHint: "Select a player", selectedPlayer: "Selected player", stepDetails: "Details", club: "Club", joinedDate: "Joined Date", shirtNumber: "Shirt Number", competitionId: "Competition", noCompetition: "No competition", retryCompetitions: "Retry", submit: "Submit" },
    linkRequest: { status: { approved: "Approved", rejected: "Rejected", pending: "Pending", invited: "Invited" }, title: "Link Request", subtitle: "Connect to a club", loadErrorTitle: "Load Error", loadErrorDescription: "Could not load data.", alreadyLinkedTitle: "Already linked", selectClub: "Select Club", searchClubPlaceholder: "Search club...", clubsErrorTitle: "Clubs Error", noClubsTitle: "No clubs", noClubsDescription: "No clubs found.", detailsTitle: "Details", loading: "Loading...", noCompetition: "No competition", summaryTitle: "Summary", summaryDescription: "Confirm details before submitting.", summaryClub: "Club", summaryCompetition: "Competition", submit: "Submit", myRequestsTitle: "My Requests", requestsErrorTitle: "Requests Error", noRequestsTitle: "No requests", noRequestsDescription: "No requests made.", lastUpdated: "Last updated", accept: "Accept", viewClub: "View club" },
    clubRequests: { columns: { player: "Player", submittedBy: "Submitted by", status: "Status", date: "Date", actions: "Actions" }, approve: "Approve", reject: "Reject", notesLabel: "Notes", rejectionReasonLabel: "Rejection reason", notesPlaceholder: "Enter notes...", confirmApprove: "Confirm Approval", confirmReject: "Confirm Rejection", title: "Club Requests", subtitle: "Manage player requests", clubErrorTitle: "Club Error", loadErrorDescription: "Could not load data.", loadErrorTitle: "Load Error", emptyTitle: "No requests", emptyDescription: "No pending requests.", filterLabel: "Filter by", filters: { pending: "Pending", all: "All", approved: "Approved", rejected: "Rejected" }, filteredEmpty: "No results for filter." },
    create: { title: "Create Player", subtitle: "Add a new player.", back: "Back" },
    form: { personalInfo: "Personal Info", firstName: "First Name", lastName: "Last Name", dateOfBirth: "Date of Birth", nationality: "Nationality", footballInfo: "Football Info", primaryPosition: "Primary Position", selectPosition: "Select Position", foot: "Preferred Foot", select: "Select", footLeft: "Left", footRight: "Right", footBoth: "Both", avatarUrl: "Avatar URL", physicalInfo: "Physical Info", height: "Height (cm)", weight: "Weight (kg)", bio: "Biography", create: "Create", verifyHint: "Verify details", clear: "Clear", creating: "Creating...", createError: "Creation error", publicProfile: "Public Profile", publicProfileHint: "Make profile publicly visible", saving: "Saving...", save: "Save", status: "Status", avatarUrlAlt: "Avatar", avatarAutoPlaceholder: "Auto", updateError: "Update error" },
    dashboard: { settingsLoading: "Loading...", subtitle: "Welcome to the player dashboard.", notFoundTitle: "Not Found", notFoundDescription: "The requested page does not exist.", explorePlayers: "Explore Players", title: "Player Dashboard", loading: "Loading...", subtitleActive: "Active", editProfile: "Edit Profile", currentClub: "Current Club", publicProfile: "Public Profile", stats: { matches: "Matches", goals: "Goals", assists: "Assists", achievements: "Achievements" }, recentDocuments: "Recent Documents", settingsTitle: "Settings", settingsNotFoundTitle: "Settings not found", settingsNotFoundDescription: "Could not load settings.", settingsSubtitle: "Manage your preferences." },
    settings: { tabs: { profile: "Profile", documents: "Documents", videos: "Videos", achievements: "Achievements" }, loading: "Loading...", notFoundTitle: "Not Found", notFoundDescription: "The page does not exist.", backToList: "Back to list", backToProfile: "Back to profile", editDescription: "Edit profile information." },
    list: { badge: "Players", title: "Discover Talent", subtitle: "Explore the player database.", discoveryDescription: "Find the best players from Angola and the World.", searchPlaceholder: "Search players...", filters: "Filters", position: "Position", allPositions: "All Positions", nationality: "Nationality", nationalityPlaceholder: "All Nationalities", availability: "Availability", allPlayers: "All Players", onlyAvailable: "Only Available", clearFilters: "Clear Filters", loadErrorTitle: "Load Error", loadErrorMessage: "Could not load players.", previous: "Previous", page: "Page", next: "Next" }
  }
};

const resources = {
  pt: { translation: pt },
  en: { translation: en }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export default i18n
