// src/components/ModalPhotos.tsx

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FaTimes, FaWhatsapp, FaShareAlt, FaHeart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Pacote } from "../types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { richTextToHtml } from '../utils/richTextToHtml';

interface ModalPhotosProps {
    pacote: Pacote;
    onClose: () => void;
}

export default function ModalPhotos({ pacote, onClose }: ModalPhotosProps) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [pacoteStats, setPacoteStats] = useState({ like: pacote.like ?? 0 });
    const canShare = typeof window !== 'undefined' && 'share' in navigator;

    // Apenas a lógica para contar likes, visualizações foi removida
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
    const formatPrice = (priceInCents: number) => {
        const priceInReals = priceInCents / 100;
        return priceInReals.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in" onClick={onClose}>
            <div className="relative w-full max-w-7xl h-full max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
                
                <button className="absolute top-2 right-2 z-20 text-white bg-black/40 hover:bg-black/60 rounded-full p-2" onClick={onClose} aria-label="Fechar">
                    <FaTimes size={20} />
                </button>

                <div className="relative w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center bg-black">
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

                <div className="w-full md:w-1/2 flex flex-col">
                    <div className="p-6 flex-grow overflow-y-auto">
                        <h2 className="text-3xl font-bold font-serif text-primary-800 mb-2">{pacote.title}</h2>
                        {pacote.subtitle && <p className="text-base text-neutral-600 mb-4">{pacote.subtitle}</p>}

                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center my-4">
                            {pacote.dates?.length > 0 && (
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-primary-800">{formatPrice(pacote.dates[0].price)}</span>
                                    <span className="text-sm text-neutral-500">à vista no Pix</span>
                                    <span className="text-sm text-neutral-500">ou {formatPrice(pacote.dates[0].price_card)} no cartão</span>
                                </div>
                            )}
                            <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                <button onClick={handleLike} className="flex items-center gap-1 text-primary-800 hover:text-red-500 transition-colors">
                                    <FaHeart />
                                    <span className="font-bold">{pacoteStats.like}</span>
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-neutral-200 pt-4">
                            <h3 className="text-lg font-semibold text-primary-800 mb-2">Saídas:</h3>
                            {pacote.dates?.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                                    {pacote.dates.map((date, index) => (
                                        <li key={index}>
                                            <span className="font-bold">{format(date.saida, 'dd/MM/yyyy', { locale: ptBR })}</span>
                                            {date.notes && <span className="text-sm text-neutral-500"> ({date.notes})</span>}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-neutral-500">Nenhuma data de saída disponível no momento.</p>
                            )}
                        </div>
                        
                        <div className="mt-6 border-t border-neutral-200 pt-4">
                            <h3 className="text-lg font-semibold text-primary-800 mb-2">Detalhes do Pacote:</h3>
                            <div className="prose prose-sm max-w-none text-neutral-700" dangerouslySetInnerHTML={{ __html: richTextToHtml(pacote.description) }} />
                        </div>
                    </div>
                    
                    <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm p-6 border-t border-neutral-200 flex flex-col sm:flex-row gap-4">
                        <a
                            href={`https://wa.me/5591985810208?text=Olá! Gostaria de mais informações sobre o pacote: ${pacote.title}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
                        >
                            <FaWhatsapp /> Fale Conosco
                        </a>
                        {canShare && (
                            <button
                                onClick={handleShare}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
                            >
                                <FaShareAlt /> Compartilhar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}