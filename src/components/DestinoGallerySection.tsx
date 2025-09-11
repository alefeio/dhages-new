// src/components/DestinoGallerySection.tsx

import React, { useCallback } from "react";
import { Destino } from "../types"; // O caminho do 'types' pode precisar de ajuste dependendo da sua estrutura de arquivos
import { GallerySection } from "./GallerySection";

// Interface corrigida para usar Destino
interface DestinoGallerySectionProps {
    destino: Destino;
    openModal: (pacoteId: string) => void;
}

function DestinoGallerySection({ destino, openModal }: DestinoGallerySectionProps) {
    if (!destino || destino.pacotes.length === 0) {
        return null;
    }

    const handleOpenModal = useCallback(
        (pacoteId: string) => {
            // Verifica se a prop é uma função antes de chamar
            if (typeof openModal === "function") {
                openModal(pacoteId);
            } else {
                console.warn("A função openModal não foi fornecida.");
            }
        },
        [openModal]
    );
    
    const whatsAppMessage = `Olá! Gostaria de mais informações sobre os pacotes de ${destino.title}.`;
    const whatsappUrl = `https://wa.me/5591981149800?text=${encodeURIComponent(whatsAppMessage)}`;

    return (
        <GallerySection
            key={destino.slug}
            destino={destino}
            buttonHref={whatsappUrl}
            onOpenModal={handleOpenModal} // Nome da prop ajustado para 'onOpenModal'
        />
    );
}

export default React.memo(DestinoGallerySection);