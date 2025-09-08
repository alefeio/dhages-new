// src/components/GallerySection.tsx

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FaWhatsapp, FaShareAlt, FaHeart } from "react-icons/fa";
import { Destino, Pacote } from "../types";
import Image from "next/image";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type GallerySectionProps = {
    destino: Destino;
    onOpenModal: (pacoteId: string) => void;
    buttonHref: string;
};

export function GallerySection({ destino, onOpenModal, buttonHref }: GallerySectionProps) {
    const [canShare, setCanShare] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [originUrl, setOriginUrl] = useState('');
    const [pacoteStats, setPacoteStats] = useState<{ [key: string]: { like: number | null; view: number | null } }>({});

    // Função de formatação de preço corrigida
    const formatPrice = useCallback((priceInCents: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
        }).format(priceInCents / 100);
    }, []);

    const handleLike = useCallback(async (pacoteId: string) => {
        try {
            const response = await fetch('/api/stats/pacote-like', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pacoteId }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro na API de curtida:', response.status, errorText);
                return;
            }
            const data = await response.json();
            if (data.success) {
                setPacoteStats(prevStats => ({
                    ...prevStats,
                    [data.pacote.id]: { like: data.pacote.like, view: data.pacote.view }
                }));
            }
        } catch (error) {
            console.error('Falha ao curtir pacote:', error);
        }
    }, []);

    const handleShare = async (pacote: Pacote, shareUrl: string) => {
        if (isSharing) return;
        setIsSharing(true);
        try {
            await navigator.share({
                title: `Pacote: ${pacote.title}`,
                text: `${pacote.subtitle ? pacote.subtitle + ' - ' : ''}Confira este pacote de viagem incrível!`,
                url: shareUrl,
            });
        } catch (error) {
            console.error('Falha ao compartilhar:', error);
        } finally {
            setIsSharing(false);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOriginUrl(window.location.origin);
            if ('share' in navigator) {
                setCanShare(true);
            }
        }
        const initialStats = destino.pacotes.reduce((acc, pacote) => {
            acc[pacote.id] = { like: pacote.like ?? 0, view: pacote.view ?? 0 };
            return acc;
        }, {} as { [key: string]: { like: number | null; view: number | null } });
        setPacoteStats(initialStats);
    }, [destino]);

    if (!destino) {
        return <p className="text-center py-8">Destino não encontrado.</p>;
    }

    const backgroundImage = destino.image || '/placeholder.jpg';

    return (
        <article className="py-8 bg-background-50">
            <div className="relative w-full h-[50vh] overflow-hidden">
                <Image
                    src={backgroundImage}
                    alt={`Background para ${destino.title}`}
                    layout="fill"
                    objectFit="cover"
                    className="absolute w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

                <div className="relative z-10 flex flex-col justify-center items-center h-full text-center">
                    <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 rounded-xl text-white px-4 py-2 drop-shadow-lg">
                        {destino.title}
                    </h2>
                    <p className="text-xl md:text-2xl text-white max-w-2xl px-4 drop-shadow-md">
                        {destino.subtitle}
                    </p>
                    <a
                        href={buttonHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center justify-center bg-secondary-400 hover:bg-secondary-500 text-primary-950 rounded-full shadow-lg py-3 px-8 font-bold text-lg transition-colors duration-300 transform hover:scale-105"
                        aria-label={`Fale conosco sobre ${destino.title}`}
                    >
                        Reserve sua aventura
                    </a>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {destino.pacotes.map(pacote => {
                        const shareUrl = `${originUrl}/pacotes/${destino.slug}/${pacote.slug}`;
                        const firstPhotoUrl = pacote.fotos[0]?.url || '/placeholder.jpg';
                        const currentLikes = pacoteStats[pacote.id]?.like ?? pacote.like ?? 0;
                        const hasDates = pacote.dates && pacote.dates.length > 0;
                        const firstDate = hasDates ? pacote.dates[0] : null;

                        return (
                            <div
                                key={pacote.id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col cursor-pointer"
                            >
                                <div className="relative w-full h-52">
                                    <Image
                                        src={firstPhotoUrl}
                                        alt={`${pacote.title}`}
                                        layout="fill"
                                        objectFit="cover"
                                        className="transition-transform duration-500 hover:scale-105"
                                        onClick={() => onOpenModal(pacote.id)}
                                    />
                                    <div className="absolute top-2 left-2 z-10">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLike(pacote.id);
                                            }}
                                            className="inline-flex items-center gap-1 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                                            aria-label="Curtir pacote"
                                        >
                                            <FaHeart className="w-5 h-5" />
                                            {currentLikes > 0 && (
                                                <span className="text-sm font-bold">{currentLikes}</span>
                                            )}
                                        </button>
                                    </div>
                                    <div className="absolute top-2 right-2 z-10">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onOpenModal(pacote.id);
                                            }}
                                            className="bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                                            aria-label="Ver mais detalhes"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-serif text-xl font-semibold mb-1 text-primary-800">{pacote.title}</h3>
                                    {pacote.subtitle && (
                                        <p className="text-sm text-neutral-600 mb-4">{pacote.subtitle}</p>
                                    )}

                                    {hasDates && (
                                        <div className="mb-4 text-sm text-neutral-700">
                                            <p className="font-bold">{pacote.dates.length > 1 ? 'Saídas:' : 'Saída:'}</p>
                                            <ul className="list-inside list-disc">
                                                {pacote.dates.map((date, index) => (
                                                    <li key={index}>
                                                        {format(date.saida, 'dd/MM/yyyy', { locale: ptBR })}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-neutral-200">
                                        {firstDate && (
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <p className="text-2xl font-bold text-primary-800">
                                                        {formatPrice(firstDate.price)}
                                                    </p>
                                                    <p className="text-sm text-neutral-500">
                                                        à vista no Pix
                                                    </p>
                                                    <p className="text-sm text-neutral-500">
                                                        ou {formatPrice(firstDate.price_card)} no cartão
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center gap-2">
                                            <a
                                                href={`https://wa.me/5591985810208?text=Olá! Gostaria de mais informações sobre o pacote de ${destino.title}: ${pacote.title}. Link: ${encodeURIComponent(shareUrl)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md py-3 font-bold transition-colors duration-300"
                                                aria-label="Reservar via WhatsApp"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FaWhatsapp className="mr-2 text-white" />
                                                Reservar
                                            </a>
                                            {canShare && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShare(pacote, shareUrl);
                                                    }}
                                                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md p-3 transition-colors duration-300"
                                                    aria-label="Compartilhar"
                                                    disabled={isSharing}
                                                >
                                                    <FaShareAlt className="w-5 h-5 text-white" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </article>
    );
}