// src/components/PacotesGallery.tsx

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import ModalPhotos from "./ModalPhotos";
import DestinoGallerySection from "./DestinoGallerySection";
import { Destino, Pacote } from "../types";
import FloatingButtons from "./FloatingButtons";

interface PacotesGalleryProps {
    destinos: Destino[];
}

export default function PacotesGallery({ destinos }: PacotesGalleryProps) {
    const [showModal, setShowModal] = useState(false);
    const [pacoteExibido, setPacoteExibido] = useState<Pacote | null>(null);
    const [shareUrl, setShareUrl] = useState<string>("");

    const router = useRouter();
    const { destinoSlug, pacoteId } = router.query;

    const openModal = useCallback((id: string) => {
        const destino = destinos.find(d => d.pacotes.some(p => p.id === id));
        const pacote = destino?.pacotes.find(p => p.id === id);

        if (destino && pacote) {
            router.push({
                pathname: router.pathname,
                query: { destinoSlug: destino.slug, pacoteId: pacote.id }
            }, `/pacotes/${destino.slug}/${pacote.slug}`, { shallow: true, scroll: false });
        } else {
            console.error("Erro: destino ou pacote não encontrado.");
        }
    }, [router, destinos]);

    const closeModal = useCallback(() => {
        setPacoteExibido(null);
        setShowModal(false);
        setShareUrl("");
        router.replace(router.pathname, undefined, { shallow: true, scroll: false });
    }, [router]);

    useEffect(() => {
        if (router.isReady && destinos.length > 0) {
            if (typeof destinoSlug === "string" && typeof pacoteId === "string") {
                const destino = destinos.find(d => d.slug === destinoSlug);
                const pacote = destino?.pacotes.find(p => p.id === pacoteId);

                if (destino && pacote) {
                    setPacoteExibido(pacote);
                    setShowModal(true);
                    // Criando o URL com o formato amigável
                    const newShareUrl = `${window.location.origin}/pacotes/${destino.slug}/${pacote.slug}`;
                    setShareUrl(newShareUrl);
                } else if (showModal) {
                    closeModal();
                }
            } else if (showModal) {
                closeModal();
            }
        }
    }, [router.isReady, destinoSlug, pacoteId, destinos, showModal, closeModal, router.pathname]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeModal();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [closeModal]);

    if (!destinos || destinos.length === 0) {
        return <p className="text-center py-8">Nenhum destino de pacote encontrado.</p>;
    }

    return (
        <>
            <section className="bg-blue-100 py-32">
                <div id="destinos">&nbsp;</div>
                <div className="text-center md:max-w-7xl mx-auto mb-16">
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight text-primary-900 drop-shadow-md">
                        Explore Nossos Destinos
                    </h2>
                    <p className="text-neutral-700 max-w-2xl mx-auto text-lg px-4">
                        Pacotes de viagem completos e experiências inesquecíveis, para que você possa focar apenas em aproveitar.
                    </p>
                </div>
                <div className="block sticky top-24 md:top-32 transform -translate-y-1/2 z-20">
                    <FloatingButtons destinos={destinos} />
                </div>

                {destinos.map((destino: Destino) => (
                    <div key={destino.slug} id={destino.slug}>
                        <DestinoGallerySection
                            destino={destino}
                            openModal={openModal}
                        />
                    </div>
                ))}

                {showModal && pacoteExibido && (
                    <ModalPhotos
                        pacote={pacoteExibido}
                        onClose={closeModal}
                        shareUrl={shareUrl}
                    />
                )}
            </section>
        </>
    );
}