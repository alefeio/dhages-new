// src/components/PacotesCatalog.tsx

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import FloatingButtons from "./FloatingButtons";
import { Destino } from "../types";
import { FaShareAlt } from "react-icons/fa";
import ModalPacoteFotos from "./ModalPacoteFotos";

interface PacotesGalleryProps {
    destinos: Destino[];
}

export default function Catalog({ destinos }: PacotesGalleryProps) {
    const [modalDestino, setModalDestino] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalIdx, setModalIdx] = useState(0);

    const [canShare, setCanShare] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const router = useRouter();
    const { destinoSlug, pacoteSlug } = router.query;

    const openModal = useCallback(
        (destinoSlug: string, pacoteSlug: string) => {
            if (destinoSlug && pacoteSlug) {
                router.push(
                    { pathname: router.pathname, query: { destinoSlug, pacoteSlug } },
                    undefined,
                    { shallow: true, scroll: false }
                );
            } else {
                console.error("Erro: slugs de destino ou pacote são nulos/undefined.");
            }
        },
        [router]
    );

    const closeModal = useCallback(() => {
        setModalDestino(null);
        setModalIdx(0);
        setShowModal(false);
        router.replace(router.pathname, undefined, { shallow: true, scroll: false });
    }, [router]);

    useEffect(() => {
        if (router.isReady && destinos.length > 0) {
            if (typeof destinoSlug === "string" && typeof pacoteSlug === "string") {
                const destino = destinos.find(d => d.slug === destinoSlug);
                const idx = destino?.pacotes.findIndex(p => p.slug === pacoteSlug);

                if (destino && idx !== undefined && idx !== -1) {
                    setModalDestino(destino.slug);
                    setModalIdx(idx);
                    setShowModal(true);
                } else if (showModal) {
                    closeModal();
                }
            } else if (showModal) {
                closeModal();
            }
        }
    }, [router.isReady, destinoSlug, pacoteSlug, destinos, showModal, closeModal]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [closeModal]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'share' in navigator) {
            setCanShare(true);
        }
    }, []);

    const handleSharePage = async () => {
        if (isSharing) return;
        setIsSharing(true);
        try {
            await navigator.share({
                title: 'Pacotes Dhages Turismo',
                text: 'Confira os pacotes e destinos incríveis da Dhages Turismo!',
                url: window.location.href,
            });
        } catch (error) {
            console.error('Falha ao compartilhar a página:', error);
        } finally {
            setIsSharing(false);
        }
    };

    if (!destinos || destinos.length === 0) {
        return <p className="text-center py-8">Nenhum destino encontrado.</p>;
    }

    return (
        <>
            <div id="destinos">&nbsp;</div>
            <section>
                <div className="flex justify-between items-center text-center md:max-w-7xl mx-auto px-4 py-2">
                    <img
                        src={"/images/logo.png"}
                        alt="Logomarca Dhages Turismo"
                        className="transition-all duration-300 w-24"
                    />
                    {canShare && (
                        <button
                            onClick={handleSharePage}
                            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-3 font-semibold text-sm transition-colors duration-300 w-fit"
                            aria-label="Compartilhar Catálogo"
                            disabled={isSharing}
                        >
                            <span className="sr-only">Compartilhar</span>
                            <FaShareAlt className="w-5 h-5 text-background-50" />
                        </button>
                    )}
                </div>

                <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mt-16">
                    Nossos Destinos e Pacotes
                </h2>

                <div className="block sticky top-8 md:top-12 transform -translate-y-1/2 z-20">
                    <FloatingButtons destinos={destinos} />
                </div>

                {destinos.map(destino => (
                    <div key={destino.slug} id={destino.slug} className="mb-16">
                        <h3 className="text-2xl font-bold mb-4">{destino.title}</h3>
                        {destino.pacotes.map((pacote, idx) => (
                            <div
                                key={pacote.id}
                                className="flex gap-4 items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-sm mb-4 cursor-pointer"
                                onClick={() => openModal(destino.slug, pacote.slug)}
                            >
                                <img
                                    src={pacote.fotos[0]?.url || "/placeholder.jpg"}
                                    alt={pacote.title}
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-400">{pacote.title}</h4>
                                    {pacote.subtitle && (
                                        <p className="text-sm text-gray-500">{pacote.subtitle}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {showModal && modalDestino && (
                    <ModalPacoteFotos
                        destinos={destinos}
                        destinoSlug={modalDestino}
                        setModalIdx={setModalIdx}
                        modalIdx={modalIdx}
                        setShowModal={setShowModal}
                        onClose={closeModal}
                    />
                )}
            </section>
        </>
    );
}
