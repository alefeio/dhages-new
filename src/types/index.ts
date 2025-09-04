export interface Banner {
    id: number;
    banners: {
        id: string;
        url: string;
        link: string;
        title: string;
        target: string;
    }[];
}

export interface MenuItem {
    id: number;
    logoUrl: string;
    links: {
        id: string;
        url: string;
        text: string;
        target: string;
    }[];
}

export interface TestimonialItem {
    id: string;
    name: string;
    content: string;
    type: string;
}

export interface FaqItem {
    id: string;
    pergunta: string;
    resposta: string;
}

/**
 * Fotos vinculadas ao Pacote
 */
export interface PacoteFoto {
    id: string;
    url: string;
    caption?: string | undefined; // permite undefined (compatível com Prisma null)
    pacoteId: string;
    pacote?: Pacote; // opcional, inclui dates
}

/**
 * Datas de saída e retorno do Pacote, com preços
 */
export interface PacoteDate {
    id: string;
    saida: string;   // ISO string no frontend
    retorno: string; // ISO string no frontend
    vagas_total: number;
    vagas_disponiveis: number;
    price: number;       // em centavos
    price_card: number;  // em centavos
    status: 'disponivel' | 'esgotado' | 'cancelado';
    notes?: string | null;
    pacoteId: string;
}

/**
 * Pacote de viagem, vinculado a um Destino
 */
export interface Pacote {
    id: string;
    title: string;
    subtitle?: string | null;
    slug: string;
    description: any; // JSON (conteúdo rico: títulos, parágrafos, tabelas)
    destinoId: string;
    fotos: PacoteFoto[];
    dates: PacoteDate[];
}

/**
 * Destino principal, que contém Pacotes
 */
export interface Destino {
    id: string;
    title: string;
    subtitle?: string | null;
    description: any; // JSON (conteúdo rico)
    image?: string | null;
    slug: string;
    pacotes: Pacote[];
}

/**
 * Props usadas na HomePage
 */
export interface HomePageProps {
    banners: Banner[];
    menu: MenuItem | null;
    testimonials: TestimonialItem[];
    faqs: FaqItem[];
    destinos: Destino[];
}
