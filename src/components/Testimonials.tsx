// src/components/Testimonials.tsx

import React, { useState, useEffect } from 'react';

// Define a tipagem dos dados
interface Testimonial {
  id: string;
  name: string;
  type: 'text' | 'video' | 'image';
  content: string;
  starRating?: number; // Adicionei para a nota das avaliações do Google
  thumbnail?: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/google-reviews');
        if (!res.ok) {
          throw new Error('Falha ao buscar avaliações');
        }
        const data: Testimonial[] = await res.json();
        setTestimonials(data);
      } catch (error) {
        setIsError(true);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (isLoading) {
    return <div className="text-center py-16">Carregando depoimentos...</div>;
  }

  if (isError) {
    return <div className="text-center py-16 text-red-600">Ocorreu um erro ao carregar os depoimentos.</div>;
  }

  if (!testimonials || testimonials.length === 0) {
    return <div className="text-center py-16 text-neutral-600">Nenhum depoimento encontrado.</div>;
  }

  return (
    <>
      <div id="depoimentos" className="py-16">&nbsp;</div>
      <section className="max-w-7xl mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight text-primary-900 drop-shadow-md">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto px-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="bg-primary-100 rounded-xl shadow-lg p-6 flex flex-col justify-between"
              aria-label={`Depoimento de ${t.name}`}
            >
              {t.type === 'text' && (
                <>
                  <p className="text-lg italic mb-4 text-neutral-700">"{t.content}"</p>
                  <span className="block text-right font-semibold text-neutral-800">{t.name}</span>
                </>
              )}
              {t.type === 'video' && (
                <div className="flex flex-col h-full">
                  <div className="relative aspect-w-16 aspect-h-9 w-full rounded-md overflow-hidden mb-4">
                    <video
                      controls
                      preload="metadata"
                      poster={t.thumbnail || undefined}
                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                      aria-label={`Depoimento em vídeo de ${t.name}`}
                    >
                      <source src={t.content} type="video/webm" />
                      <source src={t.content.replace('.webm', '.mp4')} type="video/mp4" />
                      Seu navegador não suporta a visualização de vídeos.
                    </video>
                  </div>
                  <span className="block text-right font-semibold text-neutral-800">{t.name}</span>
                </div>
              )}
              {t.type === 'image' && (
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
      </section>
    </>
  );
}