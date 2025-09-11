// src/types.ts

// --- Tipos de Banners e Menus ---

export interface BannerItem {
    id: string;
    url: string;
    link: string;
    title: string;
    target: string;
}

export interface Banner {
    id: string;
    banners: BannerItem[];
}

export interface LinkItem {
    id: string;
    text: string;
    url: string;
    target?: string;
}

export interface MenuItem {
    id: string;
    logoUrl: string;
    links: LinkItem[];
}

// --- Tipos de Testemunhos e FAQs ---

export interface Testimonial {
    id: string;
    name: string;
    content: string;
    type: 'texto' | 'foto' | 'video';
    createdAt: Date;
    updatedAt: Date;
}

export interface FaqItem {
    id: string;
    pergunta: string;
    resposta: string;
}

// --- Tipos de Pacotes e Destinos ---

export interface PacoteMidia {
    id: string;
    url: string;
    type: "image" | "video";
    caption?: string | null;
    pacoteId: string;
    pacote?: Pacote;
    like: number;
    view: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface PacoteDate {
    id: string;
    saida: Date;
    retorno: Date | undefined;
    vagas_total: number;
    vagas_disponiveis: number;
    price: number;
    price_card: number;
    status: "disponivel" | "esgotado" | "cancelado";
    notes?: string | null;
    whatsapp: number; // Campo `whatsapp` adicionado
    pacoteId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PacoteDateInput {
    id: string;
    saida: string;
    retorno: string;
    vagas_total: number;
    vagas_disponiveis: number;
    price: number;
    price_card: number;
    status: "disponivel" | "esgotado" | "cancelado";
    notes?: string | null;
    pacoteId: string;
}

export interface Pacote {
    id: string;
    title: string;
    subtitle?: string | null;
    slug: string;
    description: any;
    destinoId: string;
    fotos: PacoteMidia[];
    dates: PacoteDate[];
    like: number;
    view: number;
    whatsapp: number; // Campo `whatsapp` adicionado
    shared: number;   // Campo `shared` adicionado
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

export interface Destino {
    id: string;
    title: string;
    subtitle?: string | null;
    description: any;
    image?: string | null;
    slug: string;
    order: number;
    pacotes: Pacote[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

// --- Tipos de Página e Outros ---

export interface HomePageProps {
    banners: Banner[];
    menu: MenuItem | null;
    testimonials: Testimonial[];
    faqs: FaqItem[];
    destinos: Destino[];
}

export interface Blog {
    id: string;
    title: string;
    slug: string;
    content: any;
    coverImage?: string | null;
    author?: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

export interface Site {
    id: string;
    userId: string;
    tag_google_ads?: string | null;
    tag_google_analytics?: string | null;
    tag_meta?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Subscriber {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    createdAt: Date;
}