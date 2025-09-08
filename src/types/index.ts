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

export interface LinkItem {
  id: string;
  text: string;
  url: string;
  target?: string;
}

// Este tipo representa a estrutura dos dados do menu.
export interface MenuData {
  logoUrl: string;
  links: LinkItem[];
}

// Este tipo representa as props que o componente Menu espera.
export interface MenuProps {
  menuData: MenuData | null;
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

/** Fotos vinculadas ao Pacote */
export interface PacoteFoto {
    id: string;
    url: string;
    caption?: string | null;
    pacoteId: string;
    pacote?: Pacote;
    like: number;
    view: number;
    createdAt: Date;
    updatedAt: Date;
}

/** Datas de saída e retorno do Pacote, com preços */
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
    createdAt: Date;
    updatedAt: Date;
}

/** Usado no formulário/admin */
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

/** Formulário de Pacote */
export interface PacoteForm {
    id: string;
    title: string;
    subtitle?: string | null;
    description: any;
    destinoId: string;
    slug: string;
    fotos: PacoteFoto[];
    dates: PacoteDateInput[];
    like?: number;
    view?: number;
}

/** Pacote de viagem, vinculado a um Destino */
export interface Pacote {
    id: string;
    title: string;
    subtitle?: string | null;
    slug: string;
    description: any;
    destinoId: string;
    fotos: PacoteFoto[];
    dates: PacoteDate[];
    like: number;
    view: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

/** Destino principal, que contém Pacotes */
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

/** Props usadas na HomePage */
export interface HomePageProps {
    banners: Banner[];
    menu: MenuItem | null;
    testimonials: TestimonialItem[];
    faqs: FaqItem[];
    destinos: Destino[];
}

export interface Blog {
    id: string;
    title: string;
    slug: string;
    content: any; // JSON
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
