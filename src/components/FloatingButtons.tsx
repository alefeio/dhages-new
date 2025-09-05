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
        <div className={`fixed bottom-4 left-4 z-50 flex flex-col items-start space-y-2 transition-all duration-300 ease-in-out`}>
            <div className={`flex items-center space-x-2 transition-all duration-300 ease-in-out`}>
                {/* Botão para ocultar/visualizar */}
                <button
                    onClick={toggleButtons}
                    className="flex items-center justify-center w-10 h-10 bg-white text-gray-500 opacity-80 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300"
                    aria-label={showButtons ? "Ocultar botões de navegação" : "Mostrar botões de navegação"}
                >
                    {!showButtons ? <FaExpandArrowsAlt className="w-5 h-5 text-gray-700" /> : <FaCompressArrowsAlt className="w-5 h-5 text-gray-700" />}
                </button>
                {showButtons && destinos.map((destino) => (
                    <a
                        key={destino.id}
                        href={`#${destino.slug}`}
                        className={`${showButtons ? 'opacity-100 visible' : 'opacity-0 invisible'} flex items-center bg-blue-500 text-white justify-center w-10 h-10 rounded-full shadow-lg hover:opacity-80 transition-opacity duration-300`}
                        title={destino.title}
                    >
                        <span className="font-bold text-base">{destino.title.charAt(0)}</span>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default FloatingButtons;