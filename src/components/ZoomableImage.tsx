// src/components/ZoomableImage.tsx

import React, { useRef, useState, useCallback } from "react";
import { AiOutlineSearch } from "react-icons/ai";

interface ZoomableImageProps {
    src: string;
    alt: string;
}

export function ZoomableImage({ src, alt }: ZoomableImageProps) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: '50%', y: '50%' });
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleToggleZoom = useCallback(() => {
        setIsZoomed((prevIsZoomed) => !prevIsZoomed);
        // Reseta a posição ao zoom in/out para evitar comportamentos inesperados
        setZoomPosition({ x: '50%', y: '50%' });
    }, []);

    const handleInteraction = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!imageRef.current || !isZoomed || !containerRef.current) return;

        let clientX, clientY;

        if ('touches' in e) {
            // Lida com eventos de toque
            const touch = e.touches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
            e.preventDefault();
        } else {
            // Lida com eventos de mouse
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = clientX - left;
        const y = clientY - top;

        // Calcula a posição relativa dentro da imagem (entre 0 e 1)
        const relativeX = Math.max(0, Math.min(x / width, 1));
        const relativeY = Math.max(0, Math.min(y / height, 1));

        // Define a nova posição de zoom em porcentagem
        setZoomPosition({ x: `${relativeX * 100}%`, y: `${relativeY * 100}%` });
    }, [isZoomed]);

    return (
        <div
            className="bg-primary-200 flex-grow flex items-end justify-center relative w-full h-full cursor-zoom-in overflow-hidden"
            onClick={handleToggleZoom}
            onMouseMove={handleInteraction}
            onTouchStart={handleToggleZoom}
            onTouchMove={handleInteraction}
            ref={containerRef}
        >
            <img
                ref={imageRef}
                src={src}
                alt={alt}
                className="max-h-full max-w-full object-contain transition-transform ease-in-out duration-300"
                style={{
                    transform: isZoomed ? 'scale(2)' : 'scale(1)',
                    transformOrigin: `${zoomPosition.x} ${zoomPosition.y}`,
                }}
            />

            <div className={`absolute bottom-4 right-4 bg-black/60 p-2 rounded-full transition-opacity duration-300 ${isZoomed ? 'opacity-0' : 'opacity-100'}`}>
                <AiOutlineSearch className="text-background-100" size={24} />
            </div>
        </div>
    );
}