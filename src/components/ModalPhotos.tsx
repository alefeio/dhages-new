import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FaTimes, FaWhatsapp, FaShareAlt, FaHeart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Pacote } from "../types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { richTextToHtml } from '../utils/richTextToHtml';
import { PacoteDate } from "./PacoteDate";

interface ModalPhotosProps {
    pacote: Pacote;
    onClose: () => void;
    shareUrl: string;
}

const isImage = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

export default function ModalPhotos({ pacote, onClose, shareUrl }: ModalPhotosProps) {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [pacoteStats, setPacoteStats] = useState({ like: pacote.like ?? 0 });
    const canShare = typeof window !== 'undefined' && 'share' in navigator;
    const [isSharing, setIsSharing] = useState(false);

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

    const handleWhatsappClick = useCallback(async () => {
        try {
            await fetch('/api/stats/pacote-whatsapp', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pacoteId: pacote.id }),
            });
        } catch (error) {
            console.error('Falha ao registrar clique no WhatsApp:', error);
        }
    }, [pacote.id]);

    const handleSharedClick = useCallback(async () => {
        try {
            await fetch('/api/stats/pacote-shared', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pacoteId: pacote.id }),
            });
        } catch (error) {
            console.error('Falha ao registrar compartilhamento:', error);
        }
    }, [pacote.id]);

    const handleShare = async () => {
        if (canShare && !isSharing) {
            setIsSharing(true);
            try {
                await navigator.share({
                    title: `Pacote: ${pacote.title}`,
                    text: `Confira o pacote de viagem: ${pacote.title}`,
                    url: shareUrl,
                });
                await handleSharedClick();
            } catch (error) {
                console.error('Erro ao compartilhar:', error);
            } finally {
                setIsSharing(false);
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

    const availableDates = pacote.dates
        ?.filter(date => new Date(date.saida) >= new Date())
        .sort((a, b) => new Date(a.saida).getTime() - new Date(b.saida).getTime())
        .map(date => ({
            ...date,
            saida: new Date(date.saida),
            retorno: date.retorno ? new Date(date.retorno) : undefined
        }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in" onClick={onClose}>
            <div className="relative w-full max-w-7xl h-full md:max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden" onClick={(e) => e.stopPropagation()}>

                <button className="absolute top-2 right-2 z-20 text-white bg-black/40 hover:bg-black/60 rounded-full p-2" onClick={onClose} aria-label="Fechar">
                    <FaTimes size={20} className="text-white" />
                </button>

                {/* Contêiner de Mídia */}
                <div className="relative w-full md:w-1/2 flex-shrink-0 md:h-full flex items-center justify-center bg-black">
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

                {/* Contêiner de Conteúdo e Botões */}
                <div className="w-full md:w-1/2 flex flex-col md:h-full">
                    {/* Área de conteúdo rolável */}
                    <div className="flex-grow overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-3xl font-bold font-serif mb-2 text-orange-500">{pacote.title}</h2>
                            {pacote.subtitle && <p className="text-base text-neutral-600 mb-4">{pacote.subtitle}</p>}

                            <div className="flex items-center gap-4 my-4">
                                <button onClick={handleLike} className="flex items-center gap-1 text-primary-800 hover:text-red-500 transition-colors">
                                    <FaHeart size={24} className="text-red-500" />
                                    <span className="font-bold">{pacoteStats.like}</span>
                                </button>

                                {/* Botões de Ação ao lado do Curtir */}
                                <a
                                    href={`https://wa.me/5591981149800?text=Olá! Gostaria de mais informações sobre o pacote: ${pacote.title}. Link: ${encodeURIComponent(shareUrl)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-green-600 hover:text-green-800 transition-colors"
                                    aria-label="Fale conosco no WhatsApp"
                                    onClick={handleWhatsappClick}
                                >
                                    <FaWhatsapp size={24} className="text-green-700" />
                                </a>
                                {canShare && (
                                    <button
                                        onClick={handleShare}
                                        className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                                        aria-label="Compartilhar"
                                    >
                                        <FaShareAlt size={24} className="text-blue-700" />
                                    </button>
                                )}
                            </div>

                            <div className="border-t border-neutral-200 pt-4">
                                <h3 className="text-lg font-semibold text-primary-800 mb-2 uppercase">Saídas:</h3>
                                {availableDates?.length > 0 ? (
                                    <div className="flex flex-wrap gap-4 justify-start">
                                        {availableDates.map((date, index) => (
                                            <PacoteDate
                                                key={index}
                                                pacoteId={pacote.id}
                                                date={date}
                                                shareUrl={shareUrl}
                                                formatPrice={formatPrice}
                                                pacote={pacote}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-neutral-500">Nenhuma data de saída disponível no momento.</p>
                                )}
                            </div>

                            <div className="mt-6 border-t border-neutral-200 pt-4">
                                <h3 className="text-lg font-semibold text-primary-800 mb-2 uppercase">Detalhes do Pacote:</h3>
                                <div className="prose prose-sm max-w-none text-neutral-700" dangerouslySetInnerHTML={{ __html: richTextToHtml(pacote.description) }} />
                            </div>

                            <div className="mt-6 border-t border-neutral-200 pt-4">
                                <h3 className="text-lg font-semibold text-primary-800 mb-2">NOSSO PACOTE INCLUI:</h3>
                                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                                    <li>Transporte em ônibus de turismo, hospedagem com café da manhã, guia acompanhante</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-primary-800 mt-4 mb-2">IMPORTANTE:</h3>
                                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                                    <li>Este roteiro não inclui ingressos, nem despesas extras de quaisquer espécies.</li>
                                    <li>A D’ Hages Turismo reserva-se o direito de alterar a ordem da programação e horários, caso necessário, para o bom andamento da excursão.</li>
                                    <li>A D’ Hages não se responsabiliza por alterações de valores, horários e funcionamento dos atrativos citados no roteiro</li>
                                    <li>As poltronas do ônibus serão reservadas conforme a ordem de compra, sendo informado no ato do embarque.</li>
                                    <li>Este roteiro está sujeito a reajuste, sem aviso prévio.</li>
                                    <li>Reservas só serão garantidas mediante confirmação de pagamento.</li>
                                    <li>Parcelamentos em dinheiro ou depósito bancário devem estar quitados até 20 dias antes da saída da viagem.</li>
                                    <li>Hospedagens iniciam às 14h. Entrada antecipada somente se houver disponibilidade.</li>
                                    <li>A acomodação no hotel poderá ser em Apartamento Duplo, Triplo ou Quadruplo, de acordo com a estrutura do hotel/pousada contratado.</li>
                                    <li>A acomodação em Apartamento Duplo será preferencialmente para casais, de acordo com a disponibilidade do hotel.</li>
                                    <li>Documentação exigida para hospedagem de menor: Conforme previsto no Estatuto da Criança e do Adolescente, é proibida a hospedagem em hotel, pousadas e similares de CRIANÇAS ou ADOLESCENTES, menor de 18 anos desacompanhados. É necessário que todas as Crianças e Adolescentes apresentem seus documentos de identidade (RG) ou certidão de nascimento no Check-In. Lei 8.069/90 arts. 82 e 250.
                                        <ul className="list-disc list-inside space-y-1 ml-4 mt-1">
                                            <li>Se acompanhado de pai e/ou mãe: certidão de nascimento, cédula de identidade ou passaporte.</li>
                                            <li>Se desacompanhado de pai e/ou mãe: Autorização formal para hospedagem, assinada por pai e mãe, com firma reconhecida em cartório.</li>
                                        </ul>
                                    </li>
                                    <li>Favor ler o contrato que rege a compra deste produto.</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-primary-800 mt-4 mb-2">INFORMAÇÕES E RESERVAS:</h3>
                                <div className="text-sm text-neutral-700">
                                    <p><strong>D’ HAGES TURISMO</strong> - Av. Senador Lemos, 3153, lojas 30/31 - 1º piso, It Center - Sacramenta - Belém/PA</p>
                                    <p>E-mail: <a href="mailto:dhagesturismo@gmail.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">dhagesturismo@gmail.com</a></p>
                                    <p><a href="https://facebook.com/dhagesturismo" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">facebook.com/dhagesturismo</a></p>
                                    <p>Instagram: <a href="https://www.instagram.com/dhages_turismo" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@dhages_turismo</a></p>
                                    <p>Fones: <a href="https://wa.me/5591981149800" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">91 3348-5063 / 98114-9800 WhatsAp</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Botões - Fixos no final */}
                    <div className="bg-white/90 backdrop-blur-sm p-2 md:p-6 border-t border-neutral-200 flex flex-row gap-2 flex-shrink-0">
                        <a
                            href={`https://wa.me/5591981149800?text=Olá! Gostaria de mais informações sobre o pacote: ${pacote.title}. Link: ${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white text-xs md:text-base font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
                            onClick={handleWhatsappClick}
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
                </div>
            </div>
        </div>
    );
}