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

const isImage = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

export default function ModalPhotos({ pacote, onClose }: ModalPhotosProps) {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [pacoteStats, setPacoteStats] = useState({ like: pacote.like ?? 0 });
    const canShare = typeof window !== 'undefined' && 'share' in navigator;

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

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

    const nextMedia = () => {
        setCurrentMediaIndex((prevIndex) =>
            (prevIndex + 1) % pacote.fotos.length
        );
    };

    const prevMedia = () => {
        setCurrentMediaIndex((prevIndex) =>
            (prevIndex - 1 + pacote.fotos.length) % pacote.fotos.length
        );
    };

    if (!pacote || pacote.fotos.length === 0) {
        return null;
    }

    const currentMedia = pacote.fotos[currentMediaIndex];
    const formatPrice = (priceInCents: number) => {
        const priceInReals = priceInCents / 100;
        return priceInReals.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const isCurrentMediaImage = isImage(currentMedia.url);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in" onClick={onClose}>
            <div className="relative w-full max-w-7xl h-full max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>

                <button className="absolute top-2 right-2 z-20 text-white bg-black/40 hover:bg-black/60 rounded-full p-2" onClick={onClose} aria-label="Fechar">
                    <FaTimes size={20} />
                </button>

                {/* Container de Mídia: h-1/2 em mobile, h-full em desktop */}
                <div className="relative w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center bg-black">
                    {isCurrentMediaImage ? (
                        <Image
                            src={currentMedia.url}
                            alt={pacote.title}
                            width={0}
                            height={0}
                            sizes="100vw"
                            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                        />
                    ) : (
                        <video
                            src={currentMedia.url}
                            controls
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full"
                            style={{ objectFit: 'contain' }}
                        />
                    )}

                    {pacote.fotos.length > 1 && (
                        <>
                            <button
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 z-30"
                                onClick={prevMedia}
                                aria-label="Mídia anterior"
                            >
                                <FaChevronLeft size={20} />
                            </button>
                            <button
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 z-30"
                                onClick={nextMedia}
                                aria-label="Próxima mídia"
                            >
                                <FaChevronRight size={20} />
                            </button>
                        </>
                    )}
                </div>

                {/* Container de Conteúdo e Botões */}
                <div className="w-full md:w-1/2 flex flex-col sm:flex-col-reverse h-full">

                    {/* Rodapé fixo */}
                    <div className="bg-white/90 backdrop-blur-sm p-2 md:p-6 border-t border-neutral-200 flex flex-row gap-2">
                        <a
                            href={`https://wa.me/5591985810208?text=Olá! Gostaria de mais informações sobre o pacote: ${pacote.title}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white text-xs md:text-base font-bold py-3 px-6 sm: rounded-full transition-colors flex items-center justify-center gap-2"
                        >
                            <FaWhatsapp className="text-white" /> Fale Conosco
                        </a>
                        {canShare && (
                            <button
                                onClick={handleShare}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-base font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
                            >
                                <FaShareAlt className="text-white" /> Compartilhar
                            </button>
                        )}
                    </div>

                    {/* Área de conteúdo rolável */}
                    <div className="p-6 overflow-y-auto min-h-0">
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
                </div>
            </div>
        </div>
    );
}