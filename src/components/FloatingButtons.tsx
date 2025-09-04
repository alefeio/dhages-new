import React, { useState } from 'react';
import { Destino } from '../types';
import { FaCompressArrowsAlt, FaExpandArrowsAlt } from 'react-icons/fa';

type FloatingButtonsProps = {
    destinos: Destino[];
};

const FloatingButtons: React.FC<FloatingButtonsProps> = ({ destinos }) => {
    const [showButtons, setShowButtons] = useState(true);

    const toggleButtons = () => setShowButtons(!showButtons);

    // Função para gerar cores de fundo diferentes caso queira variar
    const getBgColor = (index: number) => {
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
        return colors[index % colors.length];
    };

    return (
        <div className="flex justify-center items-center space-x-2 transition-all duration-300 ease-in-out">
            {/* Botão para ocultar/visualizar */}
            <button
                onClick={toggleButtons}
                className="flex items-center justify-center w-8 h-8 bg-white text-gray-500 opacity-80 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300"
                aria-label={showButtons ? "Ocultar botões" : "Mostrar botões"}
            >
                {showButtons 
                    ? <FaCompressArrowsAlt className="w-4 h-4 text-gray-700" /> 
                    : <FaExpandArrowsAlt className="w-4 h-4 text-gray-700" />}
            </button>

            {showButtons && destinos.map((destino, idx) => (
                <a
                    key={destino.id}
                    href={`#${destino.slug}`}
                    className={`${showButtons ? 'opacity-100 visible' : 'opacity-0 invisible'} flex items-center justify-center w-8 h-8 rounded-full shadow-lg hover:opacity-80 transition-opacity duration-300 ${getBgColor(idx)}`}
                    title={destino.title}
                >
                    <span className="font-bold text-sm text-white">{destino.title.charAt(0)}</span>
                </a>
            ))}
        </div>
    );
};

export default FloatingButtons;
