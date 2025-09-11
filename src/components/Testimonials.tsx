// src/components/Testimonials.tsx

import React, { useRef } from 'react';
import Image from 'next/image';
import { Testimonial } from 'types';

// Define a tipagem das props do componente
interface TestimonialsPageProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsPageProps) {
  const scrollContainer = useRef<HTMLDivElement>(null);

  const scroll = (scrollOffset: number) => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollLeft += scrollOffset;
    }
  };

  return (
    <>
      <section className="mx-auto w-full px-4 py-32">
        <div id="depoimentos">&nbsp;</div>
        <div className="mb-12 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight text-primary-900 drop-shadow-md">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
            A satisfação dos nossos clientes é a nossa maior viagem. Confira alguns dos depoimentos de quem já viveu uma aventura conosco!
          </p>
          <p className="text-center mt-6 text-neutral-600">
            Já é nossa cliente?{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://g.page/r/CSDAOXMfoxIIEBM/review"
              className="text-secondary-500 hover:text-secondary-600 font-semibold transition-colors underline"
            >
              Conte-nos como foi sua experiência
            </a>.
          </p>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="absolute top-1/2 left-0 right-0 z-10 flex justify-between px-4 sm:px-8 -translate-y-1/2">
            <button
              onClick={() => scroll(-400)}
              className="p-2 bg-white rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity"
              aria-label="Anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll(400)}
              className="p-2 bg-white rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity"
              aria-label="Próximo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div
            ref={scrollContainer}
            className="flex gap-6 overflow-x-scroll scrollbar-hide snap-x snap-mandatory px-4 md:px-0"
            style={{ scrollBehavior: 'smooth' }}
          >
            {testimonials.map((t) => (
              <article
                key={t.id}
                className="w-full md:max-w-[400px] lg:min-w-[30%] snap-center bg-primary-100 rounded-xl shadow-lg p-6 flex-shrink-0 flex flex-col justify-between min-h-[400px]"
                aria-label={`Depoimento de ${t.name}`}
              >
                {t.type === 'texto' && (
                  <div className="max-w-[calc(100%-12px)]">
                    <p className="text-lg italic mb-4 text-neutral-700 break-words">"{t.content}"</p>
                    <span className="block text-right font-semibold text-neutral-800">{t.name}</span>
                  </div>
                )}
                {t.type === 'video' && (
                  <div className="flex flex-col h-full">
                    <div className="relative aspect-w-16 aspect-h-9 w-full flex justify-center rounded-md overflow-hidden mb-4">
                      <video
                        className="h-full object-cover"
                        controls
                        // poster={t.thumbnail || undefined}
                        playsInline
                      >
                        <source src={t.content} type="video/webm" />
                        <source src={t.content.replace('.webm', '.mp4')} type="video/mp4" />
                        <source src={t.content.replace('.webm', '.ogg')} type="video/ogg" />
                        Seu navegador não suporta a tag de vídeo.
                      </video>
                    </div>
                    <span className="block text-right font-semibold text-neutral-800">{t.name}</span>
                  </div>
                )}
                {t.type === 'foto' && (
                  <div className="relative w-full h-auto">
                    <Image
                      src={t.content}
                      alt={`Depoimento em foto de ${t.name}`}
                      width={500}
                      height={300}
                      className="w-full h-full object-cover rounded-md"
                    />
                    <div className="mt-4 text-right font-semibold text-neutral-800">{t.name}</div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}