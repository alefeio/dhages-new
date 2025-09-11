// Interfaces para os modelos de dados de Galeria

export interface GalleryPhoto {
    id?: string;
    url: string;
    altText?: string | null;
}

export interface Gallery {
    id: string;
    title: string;
    slug: string;
    photos: GalleryPhoto[];
}