import { ArrowRight, CalendarDays, CheckCircle2, Star, Zap } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

const WHATSAPP_URL =
  'https://wa.me/14698629040?text=' +
  encodeURIComponent('👋 Olá! Vim pelo site da Pulse e quero publicar um evento.')

interface CategoryInfo {
  titlePt: string
  titleEn: string
  emoji: string
  descPt: string
  descEn: string
  color: string
  benefitsPt: { title: string; desc: string }[]
  benefitsEn: { title: string; desc: string }[]
  stepsPt: { number: string; title: string; desc: string }[]
  stepsEn: { number: string; title: string; desc: string }[]
}

const categoryMap: Record<string, CategoryInfo> = {
  festas: {
    titlePt: 'Festas e Shows',
    titleEn: 'Parties & Shows',
    emoji: '🎉',
    descPt: 'Os melhores shows, festas e festivais perto de você.',
    descEn: 'The best shows, parties and festivals near you.',
    color: '#7C3AED',
    benefitsPt: [
      {
        title: 'Controle de acesso por setor',
        desc: 'Gerencie pistas, camarotes e áreas VIP com check-in por QR code e válidação offline.',
      },
      {
        title: 'Virada de lote automática',
        desc: 'Configure lotes com preços progressivos. A virada acontece automaticamente por data ou quantidade vendida.',
      },
      {
        title: 'Dashboard ao vivo',
        desc: 'Acompanhe vendas, presença e receita em tempo real durante o evento.',
      },
    ],
    benefitsEn: [
      {
        title: 'Sector access control',
        desc: 'Manage dance floors, boxes and VIP areas with QR code check-in and offline validation.',
      },
      {
        title: 'Automatic batch turnover',
        desc: 'Set up progressive-price batches. Turnover happens automatically by date or quantity sold.',
      },
      {
        title: 'Live dashboard',
        desc: 'Track sales, attendance and revenue in real time during the event.',
      },
    ],
    stepsPt: [
      { number: '01', title: 'Crie o evento e os lotes', desc: 'Configure nome, data, local, capacidade e preços em minutos.' },
      { number: '02', title: 'Divulgue sua página pública', desc: 'Link personalizado com galeria, mapa e botão de compra.' },
      { number: '03', title: 'Opere com o app Pulse', desc: 'Check-in por QR code, controle de filas e supervisão em tempo real.' },
    ],
    stepsEn: [
      { number: '01', title: 'Create the event and batches', desc: 'Set up name, date, venue, capacity and pricing in minutes.' },
      { number: '02', title: 'Share your public page', desc: 'Custom link with gallery, map and buy button.' },
      { number: '03', title: 'Operate with the Pulse app', desc: 'QR code check-in, queue control and real-time supervision.' },
    ],
  },
  parties: {
    titlePt: 'Festas e Shows',
    titleEn: 'Parties & Shows',
    emoji: '🎉',
    descPt: 'Os melhores shows, festas e festivais perto de você.',
    descEn: 'The best shows, parties and festivals near you.',
    color: '#7C3AED',
    benefitsPt: [
      {
        title: 'Controle de acesso por setor',
        desc: 'Gerencie pistas, camarotes e áreas VIP com check-in por QR code e válidação offline.',
      },
      {
        title: 'Virada de lote automática',
        desc: 'Configure lotes com preços progressivos. A virada acontece automaticamente por data ou quantidade vendida.',
      },
      {
        title: 'Dashboard ao vivo',
        desc: 'Acompanhe vendas, presença e receita em tempo real durante o evento.',
      },
    ],
    benefitsEn: [
      {
        title: 'Sector access control',
        desc: 'Manage dance floors, boxes and VIP areas with QR code check-in and offline validation.',
      },
      {
        title: 'Automatic batch turnover',
        desc: 'Set up progressive-price batches. Turnover happens automatically by date or quantity sold.',
      },
      {
        title: 'Live dashboard',
        desc: 'Track sales, attendance and revenue in real time during the event.',
      },
    ],
    stepsPt: [
      { number: '01', title: 'Crie o evento e os lotes', desc: 'Configure nome, data, local, capacidade e preços em minutos.' },
      { number: '02', title: 'Divulgue sua página pública', desc: 'Link personalizado com galeria, mapa e botão de compra.' },
      { number: '03', title: 'Opere com o app Pulse', desc: 'Check-in por QR code, controle de filas e supervisão em tempo real.' },
    ],
    stepsEn: [
      { number: '01', title: 'Create the event and batches', desc: 'Set up name, date, venue, capacity and pricing in minutes.' },
      { number: '02', title: 'Share your public page', desc: 'Custom link with gallery, map and buy button.' },
      { number: '03', title: 'Operate with the Pulse app', desc: 'QR code check-in, queue control and real-time supervision.' },
    ],
  },
  corporativos: {
    titlePt: 'Eventos Corporativos',
    titleEn: 'Corporate Events',
    emoji: '🏢',
    descPt: 'Conferências, workshops e eventos B2B com credenciamento profissional.',
    descEn: 'Conferences, workshops and B2B events with professional credentialing.',
    color: '#0057E7',
    benefitsPt: [
      {
        title: 'Credenciamento por cargo',
        desc: 'Diferencie acessos por perfil, palestrante, VIP, imprensa ou participante geral.',
      },
      {
        title: 'Relatórios executivos',
        desc: 'Exportação de presença, NPS e dados de participação para apresentar à diretoria.',
      },
      {
        title: 'Integração com empresas',
        desc: 'Convite e inscrição por domínio corporativo, com controle de vagas por departamento.',
      },
    ],
    benefitsEn: [
      {
        title: 'Role-based credentialing',
        desc: 'Differentiate access by profile, speaker, VIP, press or general attendee.',
      },
      {
        title: 'Executive reports',
        desc: 'Export attendance, NPS and participation data to present to leadership.',
      },
      {
        title: 'Company integration',
        desc: 'Corporate domain invitation and registration, with per-department seat control.',
      },
    ],
    stepsPt: [
      { number: '01', title: 'Configure perfis de acesso', desc: 'Crie categorias de ingresso com diferentes níveis de credenciamento.' },
      { number: '02', title: 'Convide participantes', desc: 'Links únicos por empresa, departamento ou cargo.' },
      { number: '03', title: 'Acompanhe em tempo real', desc: 'Dashboard com presença e engajamento durante toda a programação.' },
    ],
    stepsEn: [
      { number: '01', title: 'Configure access profiles', desc: 'Create ticket categories with different credentialing levels.' },
      { number: '02', title: 'Invite attendees', desc: 'Unique links per company, department or role.' },
      { number: '03', title: 'Track in real time', desc: 'Dashboard with attendance and engagement throughout the schedule.' },
    ],
  },
  corporate: {
    titlePt: 'Eventos Corporativos',
    titleEn: 'Corporate Events',
    emoji: '🏢',
    descPt: 'Conferências, workshops e eventos B2B com credenciamento profissional.',
    descEn: 'Conferences, workshops and B2B events with professional credentialing.',
    color: '#0057E7',
    benefitsPt: [
      {
        title: 'Credenciamento por cargo',
        desc: 'Diferencie acessos por perfil, palestrante, VIP, imprensa ou participante geral.',
      },
      {
        title: 'Relatórios executivos',
        desc: 'Exportação de presença, NPS e dados de participação para apresentar à diretoria.',
      },
      {
        title: 'Integração com empresas',
        desc: 'Convite e inscrição por domínio corporativo, com controle de vagas por departamento.',
      },
    ],
    benefitsEn: [
      {
        title: 'Role-based credentialing',
        desc: 'Differentiate access by profile, speaker, VIP, press or general attendee.',
      },
      {
        title: 'Executive reports',
        desc: 'Export attendance, NPS and participation data to present to leadership.',
      },
      {
        title: 'Company integration',
        desc: 'Corporate domain invitation and registration, with per-department seat control.',
      },
    ],
    stepsPt: [
      { number: '01', title: 'Configure perfis de acesso', desc: 'Crie categorias de ingresso com diferentes níveis de credenciamento.' },
      { number: '02', title: 'Convide participantes', desc: 'Links únicos por empresa, departamento ou cargo.' },
      { number: '03', title: 'Acompanhe em tempo real', desc: 'Dashboard com presença e engajamento durante toda a programação.' },
    ],
    stepsEn: [
      { number: '01', title: 'Configure access profiles', desc: 'Create ticket categories with different credentialing levels.' },
      { number: '02', title: 'Invite attendees', desc: 'Unique links per company, department or role.' },
      { number: '03', title: 'Track in real time', desc: 'Dashboard with attendance and engagement throughout the schedule.' },
    ],
  },
  esportivos: {
    titlePt: 'Eventos Esportivos',
    titleEn: 'Sports Events',
    emoji: '⚽',
    descPt: 'Competições, torneios e eventos de alta performance.',
    descEn: 'Competitions, tournaments and high-performance events.',
    color: '#22C55E',
    benefitsPt: [
      {
        title: 'Inscrição de atletas e equipes',
        desc: 'Formulários personalizados com dados esportivos, categoria e faixa de idade.',
      },
      {
        title: 'Controle de capacidade por setor',
        desc: 'Gerencie arquibancadas, pits e zonas restritas com credenciamento diferenciado.',
      },
      {
        title: 'Operação sem internet',
        desc: 'App Pulse funciona offline para check-in em locais sem boa cobertura de sinal.',
      },
    ],
    benefitsEn: [
      {
        title: 'Athlete and team registration',
        desc: 'Custom forms with sports data, category and age bracket.',
      },
      {
        title: 'Sector capacity control',
        desc: 'Manage stands, pits and restricted zones with differentiated credentialing.',
      },
      {
        title: 'Offline operation',
        desc: 'Pulse app works offline for check-in in venues with poor signal coverage.',
      },
    ],
    stepsPt: [
      { number: '01', title: 'Monte suas categorias', desc: 'Crie ingressos por modalidade, categoria e nível de acesso.' },
      { number: '02', title: 'Publique e divulgue', desc: 'Página pública com regulamento, mapa do local e cronograma.' },
      { number: '03', title: 'Opere no dia', desc: 'Check-in ágil por QR code e controle de staff por zona.' },
    ],
    stepsEn: [
      { number: '01', title: 'Set up your categories', desc: 'Create tickets by sport, category and access level.' },
      { number: '02', title: 'Publish and promote', desc: 'Public page with regulations, venue map and schedule.' },
      { number: '03', title: 'Operate on the day', desc: 'Fast QR code check-in and staff control by zone.' },
    ],
  },
  sports: {
    titlePt: 'Eventos Esportivos',
    titleEn: 'Sports Events',
    emoji: '⚽',
    descPt: 'Competições, torneios e eventos de alta performance.',
    descEn: 'Competitions, tournaments and high-performance events.',
    color: '#22C55E',
    benefitsPt: [
      {
        title: 'Inscrição de atletas e equipes',
        desc: 'Formulários personalizados com dados esportivos, categoria e faixa de idade.',
      },
      {
        title: 'Controle de capacidade por setor',
        desc: 'Gerencie arquibancadas, pits e zonas restritas com credenciamento diferenciado.',
      },
      {
        title: 'Operação sem internet',
        desc: 'App Pulse funciona offline para check-in em locais sem boa cobertura de sinal.',
      },
    ],
    benefitsEn: [
      {
        title: 'Athlete and team registration',
        desc: 'Custom forms with sports data, category and age bracket.',
      },
      {
        title: 'Sector capacity control',
        desc: 'Manage stands, pits and restricted zones with differentiated credentialing.',
      },
      {
        title: 'Offline operation',
        desc: 'Pulse app works offline for check-in in venues with poor signal coverage.',
      },
    ],
    stepsPt: [
      { number: '01', title: 'Monte suas categorias', desc: 'Crie ingressos por modalidade, categoria e nível de acesso.' },
      { number: '02', title: 'Publique e divulgue', desc: 'Página pública com regulamento, mapa do local e cronograma.' },
      { number: '03', title: 'Opere no dia', desc: 'Check-in ágil por QR code e controle de staff por zona.' },
    ],
    stepsEn: [
      { number: '01', title: 'Set up your categories', desc: 'Create tickets by sport, category and access level.' },
      { number: '02', title: 'Publish and promote', desc: 'Public page with regulations, venue map and schedule.' },
      { number: '03', title: 'Operate on the day', desc: 'Fast QR code check-in and staff control by zone.' },
    ],
  },
  gastronomicos: {
    titlePt: 'Eventos Gastronômicos',
    titleEn: 'Food & Drink Events',
    emoji: '🍷',
    descPt: 'Festivais de gastronomia, degustações e experiências culinárias.',
    descEn: 'Food festivals, tastings and culinary experiences.',
    color: '#F97316',
    benefitsPt: [
      {
        title: 'Ingressos por sessão e horário',
        desc: 'Controle o fluxo de visitantes criando sessões com capacidade específica por turno.',
      },
      {
        title: 'Check-in sem fila',
        desc: 'QR code individual para cada ingresso elimina longas filas na entrada do evento.',
      },
      {
        title: 'Gestão de parceiros e expositores',
        desc: 'Credenciais especiais para chefs, produtores e expositores participantes.',
      },
    ],
    benefitsEn: [
      {
        title: 'Tickets by session and time slot',
        desc: 'Control visitor flow by creating sessions with specific capacity per shift.',
      },
      {
        title: 'Queue-free check-in',
        desc: 'Individual QR code for each ticket eliminates long queues at the entrance.',
      },
      {
        title: 'Partner and exhibitor management',
        desc: 'Special credentials for chefs, producers and participating exhibitors.',
      },
    ],
    stepsPt: [
      { number: '01', title: 'Configure sessões e turnos', desc: 'Crie lotes por horário e capacidade para controlar o fluxo.' },
      { number: '02', title: 'Publique com experiência', desc: 'Página atrativa com cardápio, expositores e galeria de fotos.' },
      { number: '03', title: 'Opere sem stress', desc: 'Check-in rápido e supervisão em tempo real para toda a equipe.' },
    ],
    stepsEn: [
      { number: '01', title: 'Configure sessions and shifts', desc: 'Create batches by time and capacity to control flow.' },
      { number: '02', title: 'Publish with style', desc: 'Attractive page with menu, exhibitors and photo gallery.' },
      { number: '03', title: 'Operate stress-free', desc: 'Fast check-in and real-time supervision for the whole team.' },
    ],
  },
  food: {
    titlePt: 'Eventos Gastronômicos',
    titleEn: 'Food & Drink Events',
    emoji: '🍷',
    descPt: 'Festivais de gastronomia, degustações e experiências culinárias.',
    descEn: 'Food festivals, tastings and culinary experiences.',
    color: '#F97316',
    benefitsPt: [
      {
        title: 'Ingressos por sessão e horário',
        desc: 'Controle o fluxo de visitantes criando sessões com capacidade específica por turno.',
      },
      {
        title: 'Check-in sem fila',
        desc: 'QR code individual para cada ingresso elimina longas filas na entrada do evento.',
      },
      {
        title: 'Gestão de parceiros e expositores',
        desc: 'Credenciais especiais para chefs, produtores e expositores participantes.',
      },
    ],
    benefitsEn: [
      {
        title: 'Tickets by session and time slot',
        desc: 'Control visitor flow by creating sessions with specific capacity per shift.',
      },
      {
        title: 'Queue-free check-in',
        desc: 'Individual QR code for each ticket eliminates long queues at the entrance.',
      },
      {
        title: 'Partner and exhibitor management',
        desc: 'Special credentials for chefs, producers and participating exhibitors.',
      },
    ],
    stepsPt: [
      { number: '01', title: 'Configure sessões e turnos', desc: 'Crie lotes por horário e capacidade para controlar o fluxo.' },
      { number: '02', title: 'Publique com experiência', desc: 'Página atrativa com cardápio, expositores e galeria de fotos.' },
      { number: '03', title: 'Opere sem stress', desc: 'Check-in rápido e supervisão em tempo real para toda a equipe.' },
    ],
    stepsEn: [
      { number: '01', title: 'Configure sessions and shifts', desc: 'Create batches by time and capacity to control flow.' },
      { number: '02', title: 'Publish with style', desc: 'Attractive page with menu, exhibitors and photo gallery.' },
      { number: '03', title: 'Operate stress-free', desc: 'Fast check-in and real-time supervision for the whole team.' },
    ],
  },
  cultura: {
    titlePt: 'Arte e Cultura',
    titleEn: 'Arts & Culture',
    emoji: '🎭',
    descPt: 'Teatros, exposições, shows culturais e experiências únicas.',
    descEn: 'Theaters, exhibitions, cultural shows and unique experiences.',
    color: '#EC4899',
    benefitsPt: [
      {
        title: 'Controle de lotação por sessão',
        desc: 'Gerencie capacidade de salas e espaços com reserva de assento e controle rigoroso.',
      },
      {
        title: 'Ingressos solidários e gratuitos',
        desc: 'Suporte a eventos com ingressos de múltiplas faixas, incluindo gratuidade parcial.',
      },
      {
        title: 'Página pública imersiva',
        desc: 'Galeria de imagens, vídeos e informações detalhadas para atrair o público certo.',
      },
    ],
    benefitsEn: [
      {
        title: 'Capacity control per session',
        desc: 'Manage room and space capacity with seat reservation and strict control.',
      },
      {
        title: 'Solidarity and free tickets',
        desc: 'Support for events with multiple ticket tiers, including partial free access.',
      },
      {
        title: 'Immersive public page',
        desc: 'Image gallery, videos and detailed information to attract the right audience.',
      },
    ],
    stepsPt: [
      { number: '01', title: 'Crie o programa', desc: 'Adicione sessões, horários e elenco na página pública do evento.' },
      { number: '02', title: 'Venda com segurança', desc: 'Controle de capacidade e válidação individual de cada ingresso.' },
      { number: '03', title: 'Receba e análise', desc: 'Dados de público e receita disponíveis em tempo real.' },
    ],
    stepsEn: [
      { number: '01', title: 'Build the programme', desc: 'Add sessions, schedules and cast to the event public page.' },
      { number: '02', title: 'Sell with confidence', desc: 'Capacity control and individual validation of each ticket.' },
      { number: '03', title: 'Receive and analyze', desc: 'Audience and revenue data available in real time.' },
    ],
  },
  culture: {
    titlePt: 'Arte e Cultura',
    titleEn: 'Arts & Culture',
    emoji: '🎭',
    descPt: 'Teatros, exposições, shows culturais e experiências únicas.',
    descEn: 'Theaters, exhibitions, cultural shows and unique experiences.',
    color: '#EC4899',
    benefitsPt: [
      {
        title: 'Controle de lotação por sessão',
        desc: 'Gerencie capacidade de salas e espaços com reserva de assento e controle rigoroso.',
      },
      {
        title: 'Ingressos solidários e gratuitos',
        desc: 'Suporte a eventos com ingressos de múltiplas faixas, incluindo gratuidade parcial.',
      },
      {
        title: 'Página pública imersiva',
        desc: 'Galeria de imagens, vídeos e informações detalhadas para atrair o público certo.',
      },
    ],
    benefitsEn: [
      {
        title: 'Capacity control per session',
        desc: 'Manage room and space capacity with seat reservation and strict control.',
      },
      {
        title: 'Solidarity and free tickets',
        desc: 'Support for events with multiple ticket tiers, including partial free access.',
      },
      {
        title: 'Immersive public page',
        desc: 'Image gallery, videos and detailed information to attract the right audience.',
      },
    ],
    stepsPt: [
      { number: '01', title: 'Crie o programa', desc: 'Adicione sessões, horários e elenco na página pública do evento.' },
      { number: '02', title: 'Venda com segurança', desc: 'Controle de capacidade e válidação individual de cada ingresso.' },
      { number: '03', title: 'Receba e análise', desc: 'Dados de público e receita disponíveis em tempo real.' },
    ],
    stepsEn: [
      { number: '01', title: 'Build the programme', desc: 'Add sessions, schedules and cast to the event public page.' },
      { number: '02', title: 'Sell with confidence', desc: 'Capacity control and individual validation of each ticket.' },
      { number: '03', title: 'Receive and analyze', desc: 'Audience and revenue data available in real time.' },
    ],
  },
  infantis: {
    titlePt: 'Eventos Infantis',
    titleEn: "Children's Events",
    emoji: '🎠',
    descPt: 'Diversão segura e inesquecível para crianças e famílias.',
    descEn: 'Safe and unforgettable fun for children and families.',
    color: '#EAB308',
    benefitsPt: [
      {
        title: 'Ingresso por faixa etária',
        desc: 'Crie categorias separadas para bebês, crianças e acompanhantes com preços diferenciados.',
      },
      {
        title: 'Controle de acompanhantes',
        desc: 'Vincule ingressos infantis a responsáveis e gerencie o acesso com segurança.',
      },
      {
        title: 'Comunicação com famílias',
        desc: 'Envio automático de confirmação, lembretes e informações importantes por email.',
      },
    ],
    benefitsEn: [
      {
        title: 'Tickets by age group',
        desc: 'Create separate categories for babies, children and guardians with differentiated pricing.',
      },
      {
        title: 'Guardian control',
        desc: "Link children's tickets to guardians and manage access safely.",
      },
      {
        title: 'Family communication',
        desc: 'Automatic sending of confirmation, reminders and important information by email.',
      },
    ],
    stepsPt: [
      { number: '01', title: 'Configure faixas e categorias', desc: 'Ingressos por idade com regras de acompanhante e capacidade.' },
      { number: '02', title: 'Atraia as famílias', desc: 'Página com programação, atrações e tudo que a família precisa saber.' },
      { number: '03', title: 'Opere com tranquilidade', desc: 'Check-in organizado e supervisão para garantir a segurança de todos.' },
    ],
    stepsEn: [
      { number: '01', title: 'Configure tiers and categories', desc: 'Age-based tickets with guardian rules and capacity.' },
      { number: '02', title: 'Attract families', desc: 'Page with schedule, attractions and everything families need to know.' },
      { number: '03', title: 'Operate with peace of mind', desc: 'Organised check-in and supervision to keep everyone safe.' },
    ],
  },
  kids: {
    titlePt: 'Eventos Infantis',
    titleEn: "Children's Events",
    emoji: '🎠',
    descPt: 'Diversão segura e inesquecível para crianças e famílias.',
    descEn: 'Safe and unforgettable fun for children and families.',
    color: '#EAB308',
    benefitsPt: [
      {
        title: 'Ingresso por faixa etária',
        desc: 'Crie categorias separadas para bebês, crianças e acompanhantes com preços diferenciados.',
      },
      {
        title: 'Controle de acompanhantes',
        desc: 'Vincule ingressos infantis a responsáveis e gerencie o acesso com segurança.',
      },
      {
        title: 'Comunicação com famílias',
        desc: 'Envio automático de confirmação, lembretes e informações importantes por email.',
      },
    ],
    benefitsEn: [
      {
        title: 'Tickets by age group',
        desc: 'Create separate categories for babies, children and guardians with differentiated pricing.',
      },
      {
        title: 'Guardian control',
        desc: "Link children's tickets to guardians and manage access safely.",
      },
      {
        title: 'Family communication',
        desc: 'Automatic sending of confirmation, reminders and important information by email.',
      },
    ],
    stepsPt: [
      { number: '01', title: 'Configure faixas e categorias', desc: 'Ingressos por idade com regras de acompanhante e capacidade.' },
      { number: '02', title: 'Atraia as famílias', desc: 'Página com programação, atrações e tudo que a família precisa saber.' },
      { number: '03', title: 'Opere com tranquilidade', desc: 'Check-in organizado e supervisão para garantir a segurança de todos.' },
    ],
    stepsEn: [
      { number: '01', title: 'Configure tiers and categories', desc: 'Age-based tickets with guardian rules and capacity.' },
      { number: '02', title: 'Attract families', desc: 'Page with schedule, attractions and everything families need to know.' },
      { number: '03', title: 'Operate with peace of mind', desc: 'Organised check-in and supervision to keep everyone safe.' },
    ],
  },
  religiosos: {
    titlePt: 'Eventos Religiosos',
    titleEn: 'Religious Events',
    emoji: '✝️',
    descPt: 'Encontros, congressos e eventos de fé organizados com respeito e profissionalismo.',
    descEn: 'Gatherings, congresses and faith events organized with respect and professionalism.',
    color: '#6366F1',
    benefitsPt: [
      {
        title: 'Inscrições gratuitas e pagas',
        desc: 'Suporte a eventos com entrada gratuita, doação opcional ou ingresso com valor fixo.',
      },
      {
        title: 'Gestão de grandes volumes',
        desc: 'Infraestrutura preparada para eventos com milhares de participantes sem travamentos.',
      },
      {
        title: 'Credenciamento por ministério',
        desc: 'Diferencie acesso para líderes, ministros, voluntários e congregação em geral.',
      },
    ],
    benefitsEn: [
      {
        title: 'Free and paid registrations',
        desc: 'Support for events with free entry, optional donation or fixed-price tickets.',
      },
      {
        title: 'High-volume management',
        desc: 'Infrastructure prepared for events with thousands of attendees without slowdowns.',
      },
      {
        title: 'Ministry-based credentialing',
        desc: 'Differentiate access for leaders, ministers, volunteers and the general congregation.',
      },
    ],
    stepsPt: [
      { number: '01', title: 'Configure inscrições e acesso', desc: 'Gratuito, por doação ou ingresso. Você define as regras.' },
      { number: '02', title: 'Divulgue para a comunidade', desc: 'Página pública com programação, localização e como se inscrever.' },
      { number: '03', title: 'Acolha com organização', desc: 'Check-in ágil para acolher cada participante com cuidado.' },
    ],
    stepsEn: [
      { number: '01', title: 'Set up registrations and access', desc: 'Free, by donation or ticketed. You define the rules.' },
      { number: '02', title: 'Share with the community', desc: 'Public page with programme, location and how to register.' },
      { number: '03', title: 'Welcome with organisation', desc: 'Fast check-in to welcome each attendee with care.' },
    ],
  },
  religious: {
    titlePt: 'Eventos Religiosos',
    titleEn: 'Religious Events',
    emoji: '✝️',
    descPt: 'Encontros, congressos e eventos de fé organizados com respeito e profissionalismo.',
    descEn: 'Gatherings, congresses and faith events organized with respect and professionalism.',
    color: '#6366F1',
    benefitsPt: [
      {
        title: 'Inscrições gratuitas e pagas',
        desc: 'Suporte a eventos com entrada gratuita, doação opcional ou ingresso com valor fixo.',
      },
      {
        title: 'Gestão de grandes volumes',
        desc: 'Infraestrutura preparada para eventos com milhares de participantes sem travamentos.',
      },
      {
        title: 'Credenciamento por ministério',
        desc: 'Diferencie acesso para líderes, ministros, voluntários e congregação em geral.',
      },
    ],
    benefitsEn: [
      {
        title: 'Free and paid registrations',
        desc: 'Support for events with free entry, optional donation or fixed-price tickets.',
      },
      {
        title: 'High-volume management',
        desc: 'Infrastructure prepared for events with thousands of attendees without slowdowns.',
      },
      {
        title: 'Ministry-based credentialing',
        desc: 'Differentiate access for leaders, ministers, volunteers and the general congregation.',
      },
    ],
    stepsPt: [
      { number: '01', title: 'Configure inscrições e acesso', desc: 'Gratuito, por doação ou ingresso. Você define as regras.' },
      { number: '02', title: 'Divulgue para a comunidade', desc: 'Página pública com programação, localização e como se inscrever.' },
      { number: '03', title: 'Acolha com organização', desc: 'Check-in ágil para acolher cada participante com cuidado.' },
    ],
    stepsEn: [
      { number: '01', title: 'Set up registrations and access', desc: 'Free, by donation or ticketed. You define the rules.' },
      { number: '02', title: 'Share with the community', desc: 'Public page with programme, location and how to register.' },
      { number: '03', title: 'Welcome with organisation', desc: 'Fast check-in to welcome each attendee with care.' },
    ],
  },
}

const FALLBACK: CategoryInfo = {
  titlePt: 'Todos os Eventos',
  titleEn: 'All Events',
  emoji: '🎟️',
  descPt: 'Descubra eventos incríveis perto de você.',
  descEn: 'Discover incredible events near you.',
  color: '#4285F4',
  benefitsPt: [
    {
      title: 'Venda online com segurança',
      desc: 'Checkout rápido, pagamento parcelado e confirmação instantânea por email.',
    },
    {
      title: 'Operação profissional',
      desc: 'Check-in por QR code, controle de fluxo e supervisão em tempo real para qualquer tipo de evento.',
    },
    {
      title: 'Relatórios completos',
      desc: 'Dados de vendas, presença e receita em um dashboard intuitivo.',
    },
  ],
  benefitsEn: [
    {
      title: 'Secure online sales',
      desc: 'Fast checkout, instalment payments and instant email confirmation.',
    },
    {
      title: 'Professional operations',
      desc: 'QR code check-in, flow control and real-time supervision for any type of event.',
    },
    {
      title: 'Complete reports',
      desc: 'Sales, attendance and revenue data in an intuitive dashboard.',
    },
  ],
  stepsPt: [
    { number: '01', title: 'Crie seu evento', desc: 'Configure em minutos e publique sua página de vendas.' },
    { number: '02', title: 'Venda ingressos', desc: 'Checkout otimizado para mobile com múltiplas formas de pagamento.' },
    { number: '03', title: 'Opere e análise', desc: 'App de operação + dashboard de resultados em tempo real.' },
  ],
  stepsEn: [
    { number: '01', title: 'Create your event', desc: 'Set up in minutes and publish your sales page.' },
    { number: '02', title: 'Sell tickets', desc: 'Mobile-optimised checkout with multiple payment methods.' },
    { number: '03', title: 'Operate and analyze', desc: 'Operations app + real-time results dashboard.' },
  ],
}

const BENEFIT_ICONS = [Star, Zap, CalendarDays]

export function EventosCategoriaPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()

  const path = window.location.pathname
  const slug = path.split('/').pop() ?? ''
  const info = categoryMap[slug] ?? FALLBACK

  const categoryTitle = isPortuguese ? info.titlePt : info.titleEn
  const categoryDesc = isPortuguese ? info.descPt : info.descEn
  const benefits = isPortuguese ? info.benefitsPt : info.benefitsEn
  const steps = isPortuguese ? info.stepsPt : info.stepsEn

  useSeoMeta({
    title: `${categoryTitle} | Pulse`,
    description: categoryDesc,
  })

  return (
    <PublicLayout onLogin={onLogin}>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-5 pb-20 pt-14 md:px-8 md:pb-28 md:pt-20 lg:px-10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${info.color}22 0%, transparent 55%), radial-gradient(circle at 75% 70%, ${info.color}10 0%, transparent 45%)`,
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1540px]">
          <div className="text-[10px] uppercase tracking-[0.38em]" style={{ color: info.color }}>
            {isPortuguese ? 'Categoria' : 'Category'}
          </div>

          <div className="mt-6 flex items-center gap-5">
            <span className="text-[clamp(3rem,6vw,5rem)] leading-none">{info.emoji}</span>
            <h1 className="text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.88] tracking-[-0.04em] text-white">
              {categoryTitle}
            </h1>
          </div>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">
            {categoryDesc}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/events"
              className="inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: info.color,
                boxShadow: `0 16px 40px ${info.color}40`,
              }}
            >
              {isPortuguese ? 'Ver eventos disponíveis' : 'Browse available events'}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/18 px-7 py-4 text-sm font-medium uppercase tracking-[0.18em] text-white/70 transition-all hover:border-white/28 hover:text-white"
            >
              {isPortuguese ? 'Falar com a equipe' : 'Talk to the team'}
            </a>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="mb-12">
            <div className="text-[10px] uppercase tracking-[0.38em]" style={{ color: info.color }}>
              {isPortuguese ? 'Por que usar a Pulse' : 'Why use Pulse'}
            </div>
            <h2 className="mt-5 max-w-2xl text-[clamp(2.2rem,4.5vw,3.6rem)] font-bold leading-[0.9] tracking-[-0.03em] text-white">
              {isPortuguese
                ? `Por que usar a Pulse para ${info.titlePt.toLowerCase()}?`
                : `Why use Pulse for ${info.titleEn.toLowerCase()}?`}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, i) => {
              const Icon = BENEFIT_ICONS[i] ?? Star
              return (
                <div
                  key={benefit.title}
                  className="group rounded-2xl border border-white/8 bg-white/[0.03] p-8 transition-all duration-300 hover:border-white/14 hover:bg-white/[0.05]"
                >
                  <div
                    className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border"
                    style={{
                      borderColor: `${info.color}30`,
                      backgroundColor: `${info.color}15`,
                      color: info.color,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/50">{benefit.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="mb-12">
            <div className="text-[10px] uppercase tracking-[0.38em]" style={{ color: info.color }}>
              {isPortuguese ? 'Como funciona' : 'How it works'}
            </div>
            <h2 className="mt-5 max-w-2xl text-[clamp(2.2rem,4.5vw,3.6rem)] font-bold leading-[0.9] tracking-[-0.03em] text-white">
              {isPortuguese
                ? `Como funciona para ${info.titlePt.toLowerCase()}`
                : `How it works for ${info.titleEn.toLowerCase()}`}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group rounded-2xl border border-white/8 bg-white/[0.03] p-8 transition-all duration-300 hover:border-white/14 hover:bg-white/[0.05]"
              >
                <div
                  className="font-mono text-5xl font-bold opacity-50"
                  style={{ color: info.color }}
                >
                  {step.number}
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/50">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div
            className="relative overflow-hidden rounded-2xl border border-white/8 px-8 py-16 text-center lg:px-16 lg:py-20"
            style={{
              background: `linear-gradient(135deg, ${info.color}25 0%, rgba(10,10,10,0.97) 50%, ${info.color}0d 100%)`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${info.color}30, transparent 60%)`,
              }}
            />
            <div className="relative z-10">
              <div className="mb-4 text-4xl">{info.emoji}</div>
              <h2 className="text-[clamp(2.6rem,5vw,4.8rem)] font-bold leading-[0.88] tracking-[-0.04em] text-white">
                {isPortuguese
                  ? `Publique seu evento de ${info.titlePt.toLowerCase()}`
                  : `Publish your ${info.titleEn.toLowerCase()} event`}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/50">
                {isPortuguese
                  ? 'Sem mensalidade. Sem contrato. Você só paga quando vender.'
                  : 'No monthly fee. No contract. You only pay when you sell.'}
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="/create-event"
                  className="inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all hover:-translate-y-0.5"
                  style={{
                    backgroundColor: info.color,
                    boxShadow: `0 16px 40px ${info.color}40`,
                  }}
                >
                  {isPortuguese ? 'Criar evento grátis' : 'Create free event'}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-full border border-white/18 px-7 py-4 text-sm font-medium uppercase tracking-[0.18em] text-white/70 transition-all hover:border-white/28 hover:text-white"
                >
                  {isPortuguese ? 'Comprar ingressos' : 'Browse tickets'}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
