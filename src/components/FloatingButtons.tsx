import React, { useState } from 'react';
import { FaCompressArrowsAlt, FaExpandArrowsAlt } from 'react-icons/fa';
import { Destino } from 'types'; // Importa o tipo Destino

interface FloatingButtonsProps {
    destinos: Destino[]; // Agora o componente recebe um array de Destino
}

const FloatingButtons: React.FC<FloatingButtonsProps> = ({ destinos }) => {
    const [showButtons, setShowButtons] = useState(true);

    const toggleButtons = () => {
        setShowButtons(!showButtons);
    };

    return (
        <div className="block sticky top-24 md:top-32 transform -translate-y-1/2 z-20">
            {/* Botão para ocultar/visualizar */}
            <div className={`flex justify-center items-center space-x-2 transition-all duration-300 ease-in-out`}>
                <button
                    onClick={toggleButtons}
                    className="flex items-center justify-center w-8 h-8 bg-white text-gray-500 opacity-80 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300"
                    aria-label={showButtons ? "Ocultar botões" : "Mostrar botões"}
                >
                    {/* Ícone de menu (três pontos) */}
                    {!showButtons ? <FaExpandArrowsAlt className="w-4 h-4 text-primary" />
                        : <FaCompressArrowsAlt className="w-4 h-4 text-primary" />}
                </button>
                {showButtons && destinos.map((destino) => (
                    <a
                        key={destino.id}
                        href={`#${destino.slug}`}
                        className={`${showButtons ? 'opacity-100 visible' : 'opacity-0 invisible'} flex bg-blue-500 items-center justify-center p-2 rounded-full shadow-lg hover:opacity-80 transition-opacity duration-300`}
                        title={destino.title}
                    >
                        <span className="font-bold text-sm text-white">{destino.title}</span>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default FloatingButtons;