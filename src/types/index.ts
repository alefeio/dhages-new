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

export interface ColecaoItem {
    id: string;
    productMark: string;
    productModel: string;
    cor: string;
    img: string;
    slug: string;
    colecaoId: string;
    
    // Adicione a propriedade description, se ela existir no seu schema
    description?: string | null;
    
    // Adicione os novos campos aqui, tornando-os opcionais (com '?')
    size?: string | null;
    price?: number | null;
    price_card?: number | null;
    like?: number | null;
    view?: number | null;

    // Adicione os campos 'tamanho', 'preco', e 'precoParcelado'
    tamanho?: string | null;
    preco?: string | null;
    precoParcelado?: string | null;
}

export interface ColecaoProps {
    id: string; 
    title: string; 
    subtitle: string | null; 
    description: string | null;
    bgcolor: string | null; 
    buttonText: string | null; 
    buttonUrl: string | null;
    // Adicionado o campo 'order' aqui e ajustado para ser opcional/nulo
    order: number | null;
    slug: string; 
    items: ColecaoItem[];
}

export interface HomePageProps {
    banners: Banner[];
    menu: MenuItem | null;
    testimonials: TestimonialItem[];
    faqs: FaqItem[];
    colecoes: ColecaoProps[];
}