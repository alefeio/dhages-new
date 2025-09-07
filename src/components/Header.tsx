// src/components/AboutSection.tsx

import { useState } from "react";
import Image from "next/image";

const benefits = [
    {
        q: "Qualidade e Conforto Garantidos",
        a: [
            "Frota de veículos modernos com ar condicionado e Wi-Fi.",
            "Roteiros planejados para otimizar seu tempo e garantir a melhor experiência.",
            "Seleção de pousadas e hotéis que priorizam seu bem-estar."
        ]
    },
    {
        q: "Sua Segurança em Primeiro Lugar",
        a: [
            "Guias experientes e credenciados, garantindo sua total segurança.",
            "Agência credenciada e com anos de experiência no mercado de turismo.",
            "Suporte completo 24/7 antes, durante e depois da sua viagem."
        ]
    },
    {
        q: "Experiências para a Família",
        a: [
            "Pacotes de viagem completos e seguros para todas as idades.",
            "Criamos roteiros que fortalecem laços e geram boas recordações.",
            "Planejamos cada detalhe para atender às necessidades de crianças e adultos."
        ]
    }
];

export default function AboutSection() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section id="empresa" className="relative my-16 md:max-w-6xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0">
                <Image
                    src="/images/bg-about.jpg"
                    alt="Pessoas em uma excursão da D'Hages Turismo"
                    layout="fill"
                    objectFit="cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 w-full mx-auto p-4 md:p-8 bg-white/90 rounded-xl">
                <div className="mb-6 text-center md:max-w-4xl mx-auto px-4">
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight text-primary-900 drop-shadow-md">
                        Explore o Brasil com a D'Hages Turismo
                    </h2>
                    <p className="py-6 text-neutral-700 max-w-2xl mx-auto">
                        **Desde 2015, a D’Hages Turismo é sua agência de viagens em Belém - PA**, especializada em **excursões por todo o Brasil**. Nosso foco é em **viagens econômicas e rápidas**, sempre com o máximo de conforto e segurança.
                    </p>
                </div>

                <div className="md:grid md:grid-cols-2 gap-8 px-4 items-start">
                    <div className="rounded-xl mx-auto md:mx-0 flex-1 shadow-lg overflow-hidden">
                        <video
                            src="/videos/institucional.mp4"
                            muted
                            controls
                            poster="/videos/institucional_preview.jpg"
                            width="100%"
                            className="rounded-xl"
                        >
                            Seu navegador não suporta a reprodução de vídeos.
                        </video>
                    </div>

                    <div className="mx-auto md:mx-0 max-w-2xl flex-1">
                        <h3 className="font-serif text-2xl md:text-3xl font-bold mt-8 md:mt-0 text-primary-800 drop-shadow-md">
                            Da riqueza natural do Pará aos encantos de todo o Brasil
                        </h3>
                        <p className="my-4 text-neutral-800">
                            Somos especialistas em criar experiências inesquecíveis, como **excursões para os Lençóis Maranhenses** e **viagens para Jericoacoara**, que cabem no seu bolso e no seu tempo.
                        </p>
                        <p className="mb-8 text-neutral-800">
                            Nossa missão é simplificar sua viagem, oferecendo **viagens em família** e passeios que combinam **qualidade, segurança e o melhor custo-benefício** para você focar apenas em aproveitar.
                        </p>

                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="mb-4 border-b border-primary-100 bg-primary-50 px-4 py-2 rounded-xl shadow-sm">
                                <button
                                    id={`benefit-button-${idx}`}
                                    aria-expanded={open === idx}
                                    aria-controls={`benefit-panel-${idx}`}
                                    className="w-full flex justify-between items-center py-4 text-left font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:ring-offset-2 rounded text-primary-800"
                                    onClick={() => setOpen(open === idx ? null : idx)}
                                >
                                    {benefit.q}
                                    <span aria-hidden="true" className="text-secondary-400 font-bold text-xl">{open === idx ? "−" : "+"}</span>
                                </button>
                                <div
                                    id={`benefit-panel-${idx}`}
                                    role="region"
                                    aria-labelledby={`benefit-button-${idx}`}
                                    className={`overflow-hidden transition-all duration-300 ${open === idx ? "max-h-60" : "max-h-0"}`}
                                >
                                    {benefit.a.map((topic: string, i: number) => (
                                        <p key={i} className="px-2 py-1 text-neutral-600">
                                            {topic}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}