// src/components/CollectionGalleryCatalog.tsx

import React, { useCallback } from "react";
// Removida a importação do hook useGalleryNavigation
import { ColecaoProps } from "types";
import { GalleryCatalog } from "./GalleryCatalog";

interface CollectionGallerySectionProps {
    collection: ColecaoProps;
    openModal: (collectionSlug: string, itemSlug: string) => void;
}

function CollectionGalleryCatalog({ collection, openModal }: CollectionGallerySectionProps) {
    if (!collection || collection.items.length === 0) {
        return null;
    }

    const handleOpenModal = useCallback(
        (collectionSlug: string, itemSlug: string) => {
            openModal(collectionSlug, itemSlug);
        },
        [openModal]
    );

    return (
        <GalleryCatalog
            key={collection.slug}
            collection={collection}
            buttonHref={collection.buttonUrl || `https://wa.me/5591985810208?text=Olá! Gostaria do Catálogo de ${collection.title}.`}
            onOpenModal={handleOpenModal}
        />
    );
}

export default React.memo(CollectionGalleryCatalog);