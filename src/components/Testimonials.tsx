// src/components/Testimonials.tsx

import React from 'react';

// Define a tipagem dos dados que serão passados para o componente
interface Testimonial {
  id: string;
  name: string;
  content: string;
  type: string;
}

// Define a tipagem das props do componente
interface TestimonialsPageProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsPageProps) {
  return (
    <>
      <div id="depoimentos">&nbsp;</div>
      <section
        className="my-16 md:max-w-5xl mx-auto px-4"
      >
        <h3 className="font-serif text-2xl md:text-3xl font-bold mb-6 text-center">
          Depoimentos
        </h3>
        <p className="text-center mb-6 border-t-2 border-textcolor-200 py-6 w-fit m-auto">
          Já é nossa cliente?{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://g.page/r/CSDAOXMfoxIIEBM/review"
            className="text-textcolor-600 underline hover:text-textcolor-800 transition-colors"
          >
            Conte-nos como foi sua experiência
          </a>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="bg-background-100 rounded-xl shadow-lg p-6"
              aria-label={`Depoimento de ${t.name}`}
            >
              <p className="text-lg italic mb-4 text-textcolor-700">"{t.content}"</p>
              <span className="block text-right font-semibold text-textcolor-800">{t.name}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}