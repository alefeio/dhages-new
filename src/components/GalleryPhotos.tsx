import React, { useState, useRef } from 'react';

// Interfaces para os modelos de dados
interface GalleryPhoto {
    id?: string;
    url: string;
    altText?: string;
}

interface Gallery {
    id: string;
    title: string;
    slug: string;
    photos: GalleryPhoto[];
}

// Define a tipagem das props do componente
interface GalleryPhotosProps {
    gallery: Gallery;
}

export default function GalleryPhotos({ gallery }: GalleryPhotosProps) {
    const scrollContainer = useRef<HTMLDivElement>(null);
    const [modalPhoto, setModalPhoto] = useState<GalleryPhoto | null>(null);

    // Função para rolar o container horizontalmente
    const scroll = (scrollOffset: number) => {
        if (scrollContainer.current) {
            scrollContainer.current.scrollLeft += scrollOffset;
        }
    };

    // Função para abrir o modal de zoom
    const openModal = (photo: GalleryPhoto) => {
        setModalPhoto(photo);
    };

    // Função para fechar o modal de zoom
    const closeModal = () => {
        setModalPhoto(null);
    };

    // Verifica se a galeria e as fotos existem antes de renderizar
    if (!gallery || !gallery.photos || gallery.photos.length === 0) {
        return null;
    }

    return (
        <>
            <section className="mx-auto w-full px-4 py-8">
                <div className="mb-8 text-center">
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight text-primary-900 drop-shadow-md">
                        {gallery.title}
                    </h2>
                    <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
                        Confira as fotos da nossa galeria: {gallery.title}.
                    </p>
                </div>

                <div className="relative max-w-7xl mx-auto">
                    {/* Botões de navegação para a rolagem */}
                    <div className="absolute top-1/2 left-0 right-0 z-20 flex justify-between px-4 sm:px-8 -translate-y-1/2">
                        <button
                            onClick={() => scroll(-400)}
                            className="p-2 bg-white rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity"
                            aria-label="Anterior"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => scroll(400)}
                            className="p-2 bg-white rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity"
                            aria-label="Próximo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Container das fotos com rolagem horizontal */}
                    <div
                        ref={scrollContainer}
                        className="flex gap-4 overflow-x-scroll scrollbar-hide snap-x snap-mandatory px-4 md:px-0"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {/* Mapeia as fotos da galeria para exibição */}
                        {gallery.photos.map((photo) => (
                            <div
                                key={photo.id}
                                // Classes ajustadas para exibir 2 fotos no mobile, 3 em telas médias e 5 em telas grandes
                                className="w-[calc(50%-1rem)] sm:w-[calc(33.333%-1rem)] xl:w-[calc(20%-1rem)] flex-shrink-0 snap-center rounded-xl overflow-hidden shadow-lg cursor-pointer"
                                onClick={() => openModal(photo)}
                            >
                                <img
                                    src={photo.url}
                                    alt={photo.altText || gallery.title}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modal de Zoom */}
            {modalPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
                    onClick={closeModal}
                >
                    <div className="relative max-w-full md:max-w-4xl w-full h-full p-4" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-white text-4xl p-2 z-50"
                            aria-label="Fechar"
                        >
                            &times;
                        </button>
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={modalPhoto.url}
                                alt={modalPhoto.altText || gallery.title}
                                className="w-full h-full object-contain rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}