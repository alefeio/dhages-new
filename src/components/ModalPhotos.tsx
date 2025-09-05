// src/components/ModalPhotos.tsx

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FaTimes, FaWhatsapp, FaShareAlt, FaHeart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Pacote } from "../types";

interface ModalPhotosProps {
    pacote: Pacote;
    onClose: () => void;
}

export default function ModalPhotos({ pacote, onClose }: ModalPhotosProps) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [pacoteStats, setPacoteStats] = useState({ like: pacote.like ?? 0, view: pacote.view ?? 0 });
    const canShare = 'share' in navigator;

    // Efeito para contar visualizações ao abrir o modal
    useEffect(() => {
        const handleView = async () => {
            try {
                const response = await fetch('/api/stats/pacote-view', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pacoteId: pacote.id }),
                });
                if (!response.ok) {
                    throw new Error('Erro ao registrar visualização.');
                }
                const data = await response.json();
                if (data.success) {
                    setPacoteStats(prevStats => ({ ...prevStats, view: data.pacote.view }));
                }
            } catch (error) {
                console.error('Falha ao registrar visualização:', error);
            }
        };
        handleView();
    }, [pacote.id]);

    const handleLike = useCallback(async () => {
        try {
            const response = await fetch('/api/stats/pacote-like', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pacoteId: pacote.id }),
            });
            if (!response.ok) {
                throw new Error('Erro ao curtir pacote.');
            }
            const data = await response.json();
            if (data.success) {
                setPacoteStats(prevStats => ({ ...prevStats, like: data.pacote.like }));
            }
        } catch (error) {
            console.error('Falha ao curtir pacote:', error);
        }
    }, [pacote.id]);

    const handleShare = async () => {
        if (canShare) {
            try {
                await navigator.share({
                    title: `Pacote: ${pacote.title}`,
                    text: `Confira o pacote de viagem: ${pacote.title}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.error('Erro ao compartilhar:', error);
            }
        }
    };

    const nextPhoto = () => {
        setCurrentPhotoIndex((prevIndex) =>
            (prevIndex + 1) % pacote.fotos.length
        );
    };

    const prevPhoto = () => {
        setCurrentPhotoIndex((prevIndex) =>
            (prevIndex - 1 + pacote.fotos.length) % pacote.fotos.length
        );
    };

    if (!pacote || pacote.fotos.length === 0) {
        return null;
    }

    const currentPhoto = pacote.fotos[currentPhotoIndex];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in" onClick={onClose}>
            <div className="relative w-full max-w-4xl h-full max-h-[90vh] bg-primary-50 rounded-lg overflow-hidden shadow-2xl flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
                
                <button className="absolute top-2 right-2 z-20 text-white bg-black/40 hover:bg-black/60 rounded-full p-2" onClick={onClose} aria-label="Fechar">
                    <FaTimes size={20} />
                </button>

                <div className="relative flex-1 h-1/2 md:h-full flex items-center justify-center bg-black">
                    <Image
                        src={currentPhoto.url}
                        alt={pacote.title}
                        layout="fill"
                        objectFit="contain"
                        className="p-4"
                    />

                    {pacote.fotos.length > 1 && (
                        <>
                            <button
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 z-30"
                                onClick={prevPhoto}
                                aria-label="Foto anterior"
                            >
                                <FaChevronLeft size={20} />
                            </button>
                            <button
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 z-30"
                                onClick={nextPhoto}
                                aria-label="Próxima foto"
                            >
                                <FaChevronRight size={20} />
                            </button>
                        </>
                    )}
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-2">{pacote.title}</h2>
                    {pacote.subtitle && <p className="text-sm text-gray-500 mb-4">{pacote.subtitle}</p>}

                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: (pacote.description as any)?.html }} />

                    <div className="mt-6 flex flex-wrap gap-4">
                        <a href={`https://wa.me/5591985810208?text=Olá! Gostaria de mais informações sobre o pacote: ${pacote.title}`} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                            <FaWhatsapp /> Fale Conosco
                        </a>

                        {canShare && (
                            <button onClick={handleShare} className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                                <FaShareAlt /> Compartilhar
                            </button>
                        )}

                        <button onClick={handleLike} className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                            <FaHeart /> Curtir ({pacoteStats.like})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}