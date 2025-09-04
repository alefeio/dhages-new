// src/components/ModalPacoteFotos.tsx
import { Dispatch, SetStateAction } from "react";
import { Destino, Pacote } from "../types";

interface ModalPacoteFotosProps {
    destinos: Destino[];
    destinoSlug: string;
    setModalIdx: Dispatch<SetStateAction<number>>;
    setShowModal: Dispatch<SetStateAction<boolean>>;
    modalIdx: number;
    onClose: () => void;
}

export default function ModalPacoteFotos({
    destinos,
    destinoSlug,
    setModalIdx,
    setShowModal,
    modalIdx,
    onClose
}: ModalPacoteFotosProps) {
    const destino = destinos.find(d => d.slug === destinoSlug);
    if (!destino) return null;

    const pacote = destino.pacotes[modalIdx];
    if (!pacote) return null;

    const handleNext = () => {
        if (modalIdx < destino.pacotes.length - 1) {
            setModalIdx(modalIdx + 1);
        }
    };

    const handlePrev = () => {
        if (modalIdx > 0) {
            setModalIdx(modalIdx - 1);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-3xl w-full relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                    Fechar
                </button>

                <h2 className="text-2xl font-bold mb-4">{pacote.title}</h2>
                {pacote.subtitle && <p className="mb-4">{pacote.subtitle}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pacote.fotos.map((foto, idx) => (
                        <img
                            key={idx}
                            src={foto.url}
                            alt={pacote.title}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    ))}
                </div>

                <div className="flex justify-between mt-4">
                    <button
                        onClick={handlePrev}
                        disabled={modalIdx === 0}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={modalIdx === destino.pacotes.length - 1}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Próximo
                    </button>
                </div>
            </div>
        </div>
    );
}
