import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import ModalPhotos from "./ModalPhotos"; // Modal de pacote
import FloatingButtons from "./FloatingButtons";
import { Destino } from "../types";

interface PacotesGalleryProps {
    destinos?: Destino[]; // <- pode ser undefined inicialmente
}

export default function PacotesGallery({ destinos = [] }: PacotesGalleryProps) {
    const [modalDestinoSlug, setModalDestinoSlug] = useState<string | null>(null);
    const [modalPacoteSlug, setModalPacoteSlug] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalIdx, setModalIdx] = useState(0);

    const router = useRouter();
    const { destinoSlug, pacoteSlug } = router.query;

    const openModal = useCallback(
        (destinoSlug: string, pacoteSlug: string) => {
            setModalDestinoSlug(destinoSlug);
            setModalPacoteSlug(pacoteSlug);
            setShowModal(true);
            router.push(
                { pathname: router.pathname, query: { destinoSlug, pacoteSlug } },
                undefined,
                { shallow: true, scroll: false }
            );
        },
        [router]
    );

    const closeModal = useCallback(() => {
        setModalDestinoSlug(null);
        setModalPacoteSlug(null);
        setShowModal(false);
        setModalIdx(0);
        router.replace(router.pathname, undefined, { shallow: true, scroll: false });
    }, [router]);

    // Sincroniza com router.query
    useEffect(() => {
        if (!router.isReady || destinos.length === 0) return;

        if (typeof destinoSlug === "string" && typeof pacoteSlug === "string") {
            const destino = destinos.find(d => d.slug === destinoSlug);
            const idx = destino?.pacotes.findIndex(p => p.slug === pacoteSlug);

            if (destino && idx !== undefined && idx !== -1) {
                setModalDestinoSlug(destino.slug);
                setModalPacoteSlug(pacoteSlug);
                setModalIdx(idx);
                setShowModal(true);
            } else {
                closeModal();
            }
        }
    }, [router.isReady, destinoSlug, pacoteSlug, destinos, closeModal]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [closeModal]);

    if (destinos.length === 0) {
        return <p className="text-center py-8">Nenhum destino encontrado.</p>;
    }

    return (
        <>
            <div id="destinos" className="my-16">&nbsp;</div>
            <section>
                <div className="text-center md:max-w-7xl mx-auto mb-16">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                        Explore nossos Destinos
                    </h2>
                    <p className="border-t-2 border-textcolor-200 text-background-700 px-4 pt-6 w-fit m-auto">
                        <strong>
                            Pacotes exclusivos, fotos incríveis e datas flexíveis para a sua viagem dos sonhos.
                        </strong>
                    </p>
                </div>

                <div className="block sticky top-24 md:top-32 transform -translate-y-1/2 z-20">
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

                {showModal && modalDestinoSlug && modalPacoteSlug && (
                    <ModalPhotos
                        destinos={destinos}
                        destinoSlug={modalDestinoSlug}
                        pacoteSlug={modalPacoteSlug}
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
