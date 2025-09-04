import React, { useEffect, useState } from "react";
import { FaWhatsapp, FaShareAlt, FaHeart } from "react-icons/fa";
import { ColecaoProps, ColecaoItem } from "types";

type GallerySectionProps = {
    collection: ColecaoProps;
    buttonHref: string;
    onOpenModal: (collectionSlug: string, itemSlug: string) => void;
};

export function GalleryCatalog({
    collection,
    buttonHref,
    onOpenModal,
}: GallerySectionProps) {
    const [canShare, setCanShare] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [originUrl, setOriginUrl] = useState("");

    const [itemStats, setItemStats] = useState<{
        [key: string]: { like: number | null; view: number | null };
    }>({});

    const handleView = async (itemId: string) => {
        try {
            const response = await fetch("/api/stats/item-view", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId }),
            });

            if (!response.ok) return;
            const data = await response.json();
            if (data.success) {
                setItemStats((prev) => ({
                    ...prev,
                    [data.item.id]: { ...prev[data.item.id], view: data.item.view },
                }));
            }
        } catch (error) {
            console.error("Falha ao registrar visualização:", error);
        }
    };

    const handleLike = async (itemId: string) => {
        try {
            const response = await fetch("/api/stats/item-like", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId }),
            });

            if (!response.ok) return;
            const data = await response.json();
            if (data.success) {
                setItemStats((prev) => ({
                    ...prev,
                    [data.item.id]: { like: data.item.like, view: data.item.view },
                }));
            }
        } catch (error) {
            console.error("Falha ao curtir item:", error);
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOriginUrl(window.location.origin);
            if ("share" in navigator) {
                setCanShare(true);
            }
        }

        const initialStats = collection.items.reduce((acc, item) => {
            acc[item.id] = { like: item.like ?? 0, view: item.view ?? 0 };
            return acc;
        }, {} as { [key: string]: { like: number | null; view: number | null } });
        setItemStats(initialStats);
    }, [collection]);

    const handleShare = async (item: ColecaoItem, shareUrl: string) => {
        if (isSharing) return;
        setIsSharing(true);
        try {
            await navigator.share({
                title: `Vestido ${item.productModel ?? ""}`,
                text: `Confira este modelo incrível: ${item.productModel ?? ""} - ${item.productMark ?? ""}!`,
                url: shareUrl,
            });
        } catch (error) {
            console.error("Falha ao compartilhar:", error);
        } finally {
            setIsSharing(false);
        }
    };

    if (!collection) {
        return <p className="text-center py-8">Coleção não encontrada.</p>;
    }

    return (
        <article className="my-16">
            <div className="relative md:max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 md:gap-6">
                    {collection.items.map((item) => {
                        const shareUrl = `${originUrl}/share/${collection.slug}/${item.slug}`;
                        const currentLikes =
                            itemStats[item.id]?.like ?? item.like ?? 0;

                        return (
                            <div
                                key={item.slug}
                                className={`m-4 overflow-hidden flex flex-col`}
                            >
                                {/* Imagem */}
                                <div className="relative">
                                    <img
                                        src={item.img}
                                        alt={`${item.productMark ?? ""} - ${item.productModel ?? ""}`}
                                        className="w-full h-100 object-cover cursor-pointer"
                                        onClick={() => {
                                            onOpenModal(collection.slug, item.slug);
                                            handleView(item.id);
                                        }}
                                    />

                                    {/* Curtidas */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLike(item.id);
                                        }}
                                        className="absolute top-2 left-2 inline-flex items-center gap-1 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
                                        aria-label="Curtir foto"
                                    >
                                        <FaHeart className="w-5 h-5" />
                                        {currentLikes > 0 && (
                                            <span className="text-sm font-bold">{currentLikes}</span>
                                        )}
                                    </button>

                                    {/* Lupa */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOpenModal(collection.slug, item.slug);
                                            handleView(item.id);
                                        }}
                                        className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 rounded-full p-2 transition"
                                        aria-label="Ver produto"
                                    >
                                        <svg
                                            className="w-5 h-5 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                {/* Infos abaixo da imagem */}
                                <div className="py-4">
                                    <h3 className="text-gray-900 font-medium">
                                        {item.productModel}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Tecido: {item.productMark}
                                    </p>
                                    {item.size && (
                                        <p className="text-sm text-gray-600">
                                            Tamanho: {item.size}
                                        </p>
                                    )}
                                    {item.price && (
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">
                                                R$ {item.price}
                                            </p>
                                            {item.price_card && (
                                                <p className="text-sm text-gray-500">
                                                    {`R$ ${new Intl.NumberFormat("pt-BR", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }).format(item.price_card)}`}
                                                    {" "}até 3x
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Ações abaixo */}
                                    <div className="flex flex-col md:flex-row gap-3 mt-3">
                                        <a
                                            href={`https://wa.me//5591985810208?text=Olá! Gostaria de reservar o modelo ${encodeURIComponent(
                                                item.productModel ?? ""
                                            )} - ${encodeURIComponent(
                                                item.productMark ?? ""
                                            )}. Link para a foto: ${encodeURIComponent(shareUrl)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-medium transition"
                                            aria-label="Reservar via WhatsApp"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <FaWhatsapp className="mr-1" /> <span className="text-xs">Reservar</span>
                                        </a>

                                        {canShare && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleShare(item, shareUrl);
                                                }}
                                                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-sm font-medium transition"
                                                aria-label="Compartilhar"
                                                disabled={isSharing}
                                            >
                                                <FaShareAlt className="mr-1" /> <span className="text-xs">Compartilhar</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </article>
    );
}
