import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
// Importe as interfaces de galeria do arquivo correto
import { Gallery, GalleryPhoto } from '../types/gallery';

// Define a tipagem das props do componente
interface GalleryPhotosProps {
    gallery: Gallery;
}

export default function GalleryPhotos({ gallery }: GalleryPhotosProps) {
    const scrollContainer = useRef<HTMLDivElement>(null);
    // Alterado para armazenar o índice da foto no modal
    const [modalPhotoIndex, setModalPhotoIndex] = useState<number | null>(null);

    // Função para rolar o container horizontalmente
    const scroll = (scrollOffset: number) => {
        if (scrollContainer.current) {
            scrollContainer.current.scrollLeft += scrollOffset;
        }
    };

    // Função para abrir o modal de zoom com base no índice da foto
    const openModal = (index: number) => {
        setModalPhotoIndex(index);
    };

    // Função para fechar o modal de zoom
    const closeModal = () => {
        setModalPhotoIndex(null);
    };
    
    // Função para navegar para a próxima foto
    const nextPhoto = useCallback(() => {
        if (modalPhotoIndex !== null && gallery.photos) {
            setModalPhotoIndex((prevIndex) => 
                (prevIndex! + 1) % gallery.photos.length
            );
        }
    }, [modalPhotoIndex, gallery.photos]);

    // Função para navegar para a foto anterior
    const prevPhoto = useCallback(() => {
        if (modalPhotoIndex !== null && gallery.photos) {
            setModalPhotoIndex((prevIndex) =>
                (prevIndex! - 1 + gallery.photos.length) % gallery.photos.length
            );
        }
    }, [modalPhotoIndex, gallery.photos]);


    // Verifica se a galeria e as fotos existem antes de renderizar
    if (!gallery || !gallery.photos || gallery.photos.length === 0) {
        return null;
    }

    // Acessa a foto atual no modal usando o índice
    const currentModalPhoto = modalPhotoIndex !== null ? gallery.photos[modalPhotoIndex] : null;

    return (
        <>
            <section id="gallery" className="mx-auto w-full px-4 py-32">
                <div className="mb-8 text-center">
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight text-primary-900 drop-shadow-md">
                        Galeria de Fotos
                    </h2>
                    <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
                        {gallery.title}
                    </p>
                </div>

                <div className="relative w-full mx-auto">
                    {/* Botões de navegação para a rolagem */}
                    <div className="absolute top-1/2 left-0 right-0 z-20 flex justify-between px-4 sm:px-8 -translate-y-1/2">
                        <button
                            onClick={() => scroll(-400)}
                            className="p-2 bg-white rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity"
                            aria-label="Anterior"
                        >
                            <FaChevronLeft className="h-6 w-6 text-neutral-800" />
                        </button>
                        <button
                            onClick={() => scroll(400)}
                            className="p-2 bg-white rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity"
                            aria-label="Próximo"
                        >
                            <FaChevronRight className="h-6 w-6 text-neutral-800" />
                        </button>
                    </div>

                    {/* Container das fotos com rolagem horizontal */}
                    <div
                        ref={scrollContainer}
                        className="flex gap-4 overflow-x-scroll scrollbar-hide snap-x snap-mandatory px-4 md:px-0"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {/* Mapeia as fotos da galeria para exibição */}
                        {gallery.photos.map((photo, index) => (
                            <div
                                key={photo.id}
                                // Classes para 5 fotos na horizontal e 3 na vertical em telas menores
                                className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.67rem)] lg:w-[calc(20%-0.8rem)] flex-shrink-0 snap-center rounded-xl overflow-hidden shadow-lg cursor-pointer aspect-[4/3] relative"
                                onClick={() => openModal(index)}
                            >
                                <Image
                                    src={photo.url}
                                    alt={photo.altText || gallery.title}
                                    fill={true}
                                    style={{ objectFit: 'cover' }}
                                    className="rounded-xl"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modal de Zoom */}
            {currentModalPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
                    onClick={closeModal}
                >
                    <div className="relative w-full max-w-7xl h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        {/* Botão de fechar */}
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-white text-4xl p-2 z-50"
                            aria-label="Fechar"
                        >
                           <FaTimes />
                        </button>

                        {/* Botão para foto anterior */}
                        <button
                            onClick={prevPhoto}
                            className="absolute left-2 md:left-4 p-2 bg-white rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity z-50"
                            aria-label="Foto anterior"
                        >
                            <FaChevronLeft className="h-6 w-6 text-neutral-800" />
                        </button>
                        
                        {/* Imagem no modal */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                                src={currentModalPhoto.url}
                                alt={currentModalPhoto.altText || gallery.title}
                                fill={true}
                                style={{ objectFit: 'contain' }}
                                className="rounded-lg"
                            />
                        </div>

                        {/* Botão para próxima foto */}
                        <button
                            onClick={nextPhoto}
                            className="absolute right-2 md:right-4 p-2 bg-white rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity z-50"
                            aria-label="Próxima foto"
                        >
                            <FaChevronRight className="h-6 w-6 text-neutral-800" />
                        </button>

                    </div>
                </div>
            )}
        </>
    );
}