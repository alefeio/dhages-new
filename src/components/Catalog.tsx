// src/components/Catalog.tsx

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import ModalPhotos from "./ModalPhotos";
import { ColecaoProps, ColecaoItem } from "../types";
import CollectionGalleryCatalog from "./CollectionGalleryCatalog";
import { FaShareAlt } from "react-icons/fa";
import FloatingButtons from "./FloatingButtons";

interface DressesGalleryProps {
    colecoes: ColecaoProps[];
}

export default function Catalog({ colecoes }: DressesGalleryProps) {
    const [modalType, setModalType] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalIdx, setModalIdx] = useState(0);

    const [canShare, setCanShare] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const router = useRouter();
    const { collectionSlug, itemSlug } = router.query;

    const openModal = useCallback((collectionSlug: string, itemSlug: string) => {
        if (collectionSlug && itemSlug) {
            router.push({
                pathname: router.pathname,
                query: { collectionSlug, itemSlug }
            }, undefined, { shallow: true, scroll: false });
        } else {
            console.error("Erro: slugs da coleção ou do item são nulos/undefined. Verifique seus dados.");
        }
    }, [router]);

    const closeModal = useCallback(() => {
        setModalType(null);
        setModalIdx(0);
        setShowModal(false);
        router.replace(router.pathname, undefined, { shallow: true, scroll: false });
    }, [router]);

    useEffect(() => {
        if (router.isReady && colecoes.length > 0) {
            if (typeof collectionSlug === "string" && typeof itemSlug === "string") {
                const col = colecoes.find(c => c.slug === collectionSlug);
                const idx = col?.items.findIndex(item => item.slug === itemSlug);

                if (col && idx !== -1 && idx !== undefined) {
                    setModalType(col.slug);
                    setModalIdx(idx);
                    setShowModal(true);
                } else if (showModal) {
                    closeModal();
                }
            } else if (showModal) {
                closeModal();
            }
        }
    }, [router.isReady, collectionSlug, itemSlug, colecoes, showModal, closeModal]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeModal();
            }
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
                title: 'Catálogo My Dress',
                text: 'Confira a nova coleção de vestidos da My Dress!',
                url: window.location.href,
            });
        } catch (error) {
            console.error('Falha ao compartilhar a página:', error);
        } finally {
            setIsSharing(false);
        }
    };

    if (!colecoes || colecoes.length === 0) {
        return <p className="text-center py-8">Falha ao carregar a galeria.</p>;
    }

    return (
        <>
            <div id="colecao">&nbsp;</div>
            <section>
                <div className="flex justify-between items-center justify-center text-center md:max-w-7xl mx-auto px-4 py-2">
                    <img
                        src={"/images/logo.png"}
                        alt="Logomarca My Dress"
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
                    Catálogo de Vestidos
                </h2>

                {/* Conteúdo da seção de informações importantes */}
                <div className="bg-white p-6 rounded-lg shadow-lg mx-auto max-w-7xl mt-8 mb-16">
                    <h2 className="text-xl font-semibold text-gray-800 text-center">Informações Essenciais para a Sua Experiência</h2>

                    <p className="text-gray-600 mb-4 text-center text-sm">
                        Para que sua experiência seja a mais tranquila e agradável possível, preparamos alguns detalhes importantes sobre nosso serviço de aluguel.
                    </p>

                    <ul className="list-none list-inside text-center space-y-3 text-gray-700">
                        <li>
                            <span className="text-lg font-semibold text-gray-800">Corteria</span>
                        </li>
                        <li className="text-sm">
                            Alugue com sua amiga para ganharem o aluguel da clutch (bolsa) de cortesia.
                        </li>
                        <li>
                            <span className="text-lg font-semibold text-gray-800">Tudo Incluso</span>
                        </li>
                        <li className="text-sm">
                            O valor do aluguel já cobre os ajustes necessários e a lavagem profissional da peça.
                        </li>
                        <li>
                            <span className="text-lg font-semibold text-gray-800">Feito para Você</span>
                        </li>
                        <li className="text-sm">
                            Nossos modelos são, em sua maioria, ajustáveis, garantindo um caimento perfeito sem a necessidade de numeração exata.
                        </li>
                        <li>
                            <span className="text-lg font-semibold text-gray-800">Facilidade no Pagamento</span>
                        </li>
                        <li className="text-sm">
                            Aceitamos Pix, dinheiro ou cartão. E para as reservas pagas com Pix ou dinheiro, oferecemos um desconto especial!
                        </li>
                        <li>
                            <span className="text-lg font-semibold text-gray-800">Reserva Garantida</span>
                        </li>
                        <li className="text-sm">
                            Para confirmar a sua reserva, solicitamos um adiantamento de 50% do valor do aluguel.
                        </li>
                    </ul>
                </div>

                <div className="block sticky top-8 md:top-12 transform -translate-y-1/2 z-20">
                    <FloatingButtons colecoes={colecoes} />
                </div>

                {colecoes.map((colecao: ColecaoProps) => (
                    <div key={colecao.slug} id={colecao.slug}>
                        <CollectionGalleryCatalog
                            collection={colecao}
                            openModal={openModal}
                        />
                    </div>
                ))}

                {showModal && modalType && (
                    <ModalPhotos
                        colecoes={colecoes}
                        modalType={modalType}
                        setModalIdx={setModalIdx}
                        setShowModal={setShowModal}
                        modalIdx={modalIdx}
                        onClose={closeModal}
                    />
                )}
            </section>
        </>
    );
}