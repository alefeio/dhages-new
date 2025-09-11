// src/components/FAQ.tsx

import { useState } from "react";
import React from 'react';
import { FaqItem as FAQType } from 'types';

// Define a tipagem das props do componente, importando do arquivo de tipos
interface FAQPageProps {
  faqs: FAQType[];
}

export default function FAQ({ faqs }: FAQPageProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <section className="mx-auto w-full px-4 py-32 bg-white">
        <div id="faq">&nbsp;</div>
        <div className="mb-12 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight text-primary-900 drop-shadow-md">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
            Confira as principais dúvidas de nossas clientes e saiba mais sobre o processo de aluguel de vestidos.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {faqs.map((faq, idx) => (
            <div key={faq.id} className="mb-4 border-b border-background-1000/20 bg-primary-100 px-4 rounded-xl">
              <button
                className="w-full flex justify-between items-center py-4 text-left font-semibold text-lg focus:outline-none"
                onClick={() => setOpen(open === idx ? null : idx)}
                aria-expanded={open === idx}
                aria-controls={`faq-answer-${idx}`}
                id={`faq-question-${idx}`}
              >
                {faq.pergunta}
                <span>{open === idx ? "−" : "+"}</span>
              </button>
              <div
                id={`faq-answer-${idx}`}
                role="region"
                aria-labelledby={`faq-question-${idx}`}
                className={`overflow-hidden transition-all duration-300 ${open === idx ? "max-h-40" : "max-h-0"}`}
              >
                <p className="px-2 pb-4">{faq.resposta}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}