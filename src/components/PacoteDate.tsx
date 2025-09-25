import React, { useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaWhatsapp } from 'react-icons/fa';
import { Pacote, PacoteDate as PacoteDateType } from '../types';

interface PacoteDateProps {
    pacoteId: string;
    date: PacoteDateType;
    shareUrl: string;
    formatPrice: (price: number) => string;
    pacote: Pacote;
}

export const PacoteDate = ({ pacoteId, date, shareUrl, formatPrice, pacote }: PacoteDateProps) => {

    const handlePreReservaClick = useCallback(async () => {
        try {
            await fetch('/api/stats/pacote-date-whatsapp', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pacoteId, dateSaida: date.saida.toISOString() }),
            });
        } catch (error) {
            console.error('Falha ao registrar clique de Mais Informações:', error);
        }
    }, [pacoteId, date.saida]);

    const whatsappText = `Olá! Gostaria de mais informações o pacote: *${pacote.title}*.\n\n` +
                         `Data de Saída: *${format(date.saida, 'dd/MM/yyyy', { locale: ptBR })}*\n` +
                         (date.retorno ? `Data de Retorno: *${format(date.retorno, 'dd/MM/yyyy', { locale: ptBR })}*\n` : '') +
                         `\nLink para o pacote: ${shareUrl}`;

    return (
        <div className="flex flex-col p-4 border border-neutral-300 rounded-lg shadow-sm bg-gray-50 flex-grow-0 flex-shrink-0 min-w-[200px]">
            <span className="font-bold text-lg text-primary-800 mb-1">
                Saída: {format(date.saida, 'dd/MM/yyyy', { locale: ptBR })}
            </span>
            {date.retorno && (
                <span className="text-sm text-neutral-600 mb-2">
                    Retorno: {format(date.retorno, 'dd/MM/yyyy', { locale: ptBR })}
                </span>
            )}
            {date.notes && <span className="text-xs text-neutral-500 mb-2"> ({date.notes})</span>}
            <div className="flex flex-col mt-auto pt-2 border-t border-neutral-200">
                <span className="text-primary-800 font-bold text-xl">{formatPrice(date.price)}</span>
                <span className="text-sm text-neutral-600">à vista no Pix</span>
                <span className="text-sm text-neutral-600">ou <span className="font-medium">{formatPrice(date.price_card)}</span> no cartão</span>
            </div>
            <a
                href={`https://wa.me/5591981149800?text=${encodeURIComponent(whatsappText)}`}
                onClick={handlePreReservaClick}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 text-white bg-green-600 hover:bg-green-700 font-bold py-2 px-4 rounded-full transition-colors"
            >
                <FaWhatsapp size={18} className='text-white' /> Mais Informações
            </a>
        </div>
    );
};