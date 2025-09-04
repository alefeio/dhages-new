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
    caption?: string | null; // aceita null vindo do banco
    pacoteId: string;
    pacote?: Pacote;
    like?: number;  // novo campo
    view?: number;  // novo campo
}

/**
 * Datas de saída e retorno do Pacote, com preços
 */
export interface PacoteDate {
    id: string;
    saida: Date;
    retorno: Date;
    vagas_total: number;
    vagas_disponiveis: number;
    price: number;
    price_card: number;
    status: "disponivel" | "esgotado" | "cancelado";
    notes?: string | null;
    pacoteId: string;
}

/**
 * Usado no formulário/admin
 */
export interface PacoteDateInput {
    id: string;
    saida: string;   // no form será string
    retorno: string; // no form será string
    vagas_total: number;
    vagas_disponiveis: number;
    price: number;
    price_card: number;
    status: "disponivel" | "esgotado" | "cancelado";
    notes?: string | null;
    pacoteId: string;
}

export interface PacoteForm {
    id: string;
    title: string;
    subtitle?: string | null;
    description: any;
    destinoId: string;
    slug: string;
    fotos: PacoteFoto[];
    dates: PacoteDateInput[]; // aqui usamos Input com string
}

/**
 * Pacote de viagem, vinculado a um Destino
 */
export interface Pacote {
    id: string;
    title: string;
    subtitle?: string | null;
    slug: string;
    description: any; // JSON
    destinoId: string;
    fotos: PacoteFoto[];
    dates: PacoteDate[]; // já vai vir com Date
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
    order: number;   // <-- campo adicionado
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
