// src/components/ModalPhotos.tsx

import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { useRouter } from "next/router";
import Head from "next/head";
import { ZoomableImage } from "./ZoomableImage";
import { ModalHeaderFooter } from "./ModalHeaderFooter";
import { Destino, PacoteFoto, Pacote } from "../types";

interface ModalPhotosProps {
    destinos: Destino[];
    destinoSlug: string;
    pacoteSlug: string;
    modalIdx: number;
    setModalIdx: React.Dispatch<React.SetStateAction<number>>;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    onClose: () => void;
}

export default function ModalPhotos({
    destinos,
    pacoteSlug,
    modalIdx,
    setModalIdx,
    setShowModal,
    onClose
}: ModalPhotosProps) {
    const router = useRouter();
    const [currentStats, setCurrentStats] = useState<{ like?: number; view?: number }>({});

    // Encontrar o pacote pelo slug
    const pacoteAtual: Pacote | undefined = destinos
        .flatMap(dest => dest.pacotes)
        .find(p => p.slug === pacoteSlug);

    const fotos: PacoteFoto[] = pacoteAtual?.fotos || [];
    const totalFotos = fotos.length;

    const nextFoto = () => setModalIdx(prev => (prev + 1) % totalFotos);
    const prevFoto = () => setModalIdx(prev => (prev - 1 + totalFotos) % totalFotos);

    const fotoAtual: PacoteFoto | undefined = fotos[modalIdx];

    useEffect(() => {
        if (!fotoAtual) return;

        const fetchStats = async () => {
            try {
                const res = await fetch("/api/stats/pacote-foto-view", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fotoId: fotoAtual.id }),
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) setCurrentStats({ like: data.foto.like, view: data.foto.view });
                }
            } catch (err) {
                console.error("Erro ao registrar visualização:", err);
            }
        };

        fetchStats();
    }, [fotoAtual?.id]);

    const handleLike = async (fotoId: string) => {
        try {
            const res = await fetch("/api/stats/pacote-foto-like", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fotoId }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) setCurrentStats({ like: data.foto.like, view: data.foto.view });
            }
        } catch (err) {
            console.error("Erro ao curtir foto:", err);
        }
    };

    if (!fotoAtual || !pacoteAtual) return null;

    const shareUrl = `${window.location.origin}/share/${pacoteAtual.slug}`;

    return (
        <>
            <Head>
                <title>{`Foto ${modalIdx + 1} - ${pacoteAtual.title}`}</title>
                <meta name="description" content={`Confira esta foto do pacote ${pacoteAtual.title}.`} />
                <meta property="og:title" content={`Foto ${modalIdx + 1} - ${pacoteAtual.title}`} />
                <meta property="og:description" content={`Confira esta foto do pacote ${pacoteAtual.title}.`} />
                <meta property="og:image" content={fotoAtual.url} />
                <meta property="og:url" content={shareUrl} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`Foto ${modalIdx + 1} - ${pacoteAtual.title}`} />
                <meta name="twitter:description" content={`Confira esta foto do pacote ${pacoteAtual.title}.`} />
                <meta name="twitter:image" content={fotoAtual.url} />
            </Head>

            <div
                className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center p-0 md:p-4"
                onClick={onClose}
            >
                <div className="relative w-fit h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
                    >
                        <AiOutlineClose size={24} />
                    </button>

                    <div className="flex-grow flex items-center justify-center w-full overflow-hidden">
                        <ZoomableImage src={fotoAtual.url} alt={fotoAtual.caption || pacoteAtual.title} />
                    </div>

                    <div className="absolute top-1/2 left-0 right-0 flex justify-between transform -translate-y-1/2 w-full p-2">
                        <button onClick={prevFoto} className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors">
                            <SlArrowLeft size={24} className="text-white" />
                        </button>
                        <button onClick={nextFoto} className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors">
                            <SlArrowRight size={24} className="text-white" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center text-white text-center w-full">
                        <ModalHeaderFooter
                            productMark={pacoteAtual.title}
                            productModel={fotoAtual.caption || ""}
                            size=""
                            shareUrl={shareUrl}
                            likes={currentStats.like}
                            views={currentStats.view}
                            onLike={() => handleLike(fotoAtual.id)}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
