// src/components/FAQ.tsx

import { useState } from "react";
import React from 'react'; // Adicione a importação de React

// Define a tipagem dos dados que serão passados para o componente
interface FAQItem {
  id: string;
  pergunta: string;
  resposta: string;
}

// Define a tipagem das props do componente
interface FAQPageProps {
  faqs: FAQItem[];
}

export default function FAQ({ faqs }: FAQPageProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <div id="faq">&nbsp;</div>
      <section className="my-16 md:max-w-7xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6 text-center">
          Perguntas Frequentes
        </h2>
        <p className="text-center mb-6 border-t-2 border-textcolor-200 py-6 w-fit m-auto">
          Confira as principais dúvidas de nossas clientes e saiba mais sobre o processo de aluguel de vestidos.
        </p>
        <div className="max-w-5xl mx-auto">
          {faqs.map((faq, idx) => (
            <div key={faq.id} className="mb-4 border-b border-background-1000/20 bg-background-100 px-4 rounded-xl">
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