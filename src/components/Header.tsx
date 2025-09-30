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
    },
    {
        q: "O Melhor Custo-Benefício",
        a: [
            "Pacotes completos com transporte, hospedagem e passeios inclusos.",
            "Preços competitivos e transparentes, para você viajar sem surpresas.",
            "Opções de pagamento flexíveis para facilitar a realização do seu sonho."
        ]
    }
];

export default function AboutSection() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section id="empresa" className="py-32 bg-white"> 
            <div className="max-w-7xl mx-auto">
                {/* Título Principal */}
                <div className="mb-12 text-center">
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight text-primary-900 drop-shadow-md">
                        Explore o Brasil com a D'Hages Turismo
                    </h2>
                    <p className="py-6 text-neutral-700 max-w-2xl mx-auto text-lg">
                        Desde 2015, a D’Hages Turismo é sua agência de viagens em Belém, PA, especializada em excursões por todo o Brasil. Nosso foco é em viagens econômicas e rápidas, sempre com o máximo de conforto e segurança.
                    </p>
                    {/* <p className="py-6 text-neutral-700 max-w-2xl mx-auto text-lg">
                        Descubra os melhores pacotes de viagem com a D'Hages Turismo em Belém/PA. Excursões para Ajuruteua, Salinas, Marajó, Lençóis Maranhenses, Fortaleza, Jericoacoara, São Luís, Serra Gaúcha e mais. Viagens econômicas com segurança e conforto.
                    </p> */}
                </div>

                {/* Container de Conteúdo em Duas Colunas */}
                <div className="flex flex-col md:flex-row gap-8 items-center p-4 md:p-8">
                    {/* Coluna do Vídeo */}
                    <div className="rounded-xl overflow-hidden shadow-lg">
                        <video
                            src="/videos/dhages.mp4"
                            muted
                            controls
                            poster="/images/bg-empresa.jpg"
                            width="100%"
                            className="rounded-xl w-full"
                            aria-label="Vídeo institucional da D'Hages Turismo"
                        >
                            Seu navegador não suporta a reprodução de vídeos.
                        </video>
                    </div>

                    {/* Coluna do Texto e Benefícios */}
                    <div className="flex-1 flex flex-col">
                        <h3 className="font-serif text-2xl md:text-3xl font-bold mt-4 md:mt-0 text-primary-800 drop-shadow-md">
                            Da riqueza natural do Pará aos encantos de todo o Brasil
                        </h3>
                        <p className="my-4 text-neutral-800">
                            Somos especialistas em criar experiências inesquecíveis, como excursões para os Lençóis Maranhenses e viagens para Jericoacoara, que cabem no seu bolso e no seu tempo.
                        </p>
                        <p className="mb-8 text-neutral-800">
                            Nossa missão é simplificar sua viagem, oferecendo viagens em família e passeios que combinam qualidade, segurança e o melhor custo-benefício para você focar apenas em aproveitar.
                        </p>

                        {/* Acordeão de Benefícios */}
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="mb-4 bg-primary-50 px-4 py-2 rounded-xl shadow-sm border border-primary-100">
                                <button
                                    id={`benefit-button-${idx}`}
                                    aria-expanded={open === idx}
                                    aria-controls={`benefit-panel-${idx}`}
                                    className="w-full flex justify-between items-center py-4 text-left font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:ring-offset-2 rounded text-primary-800"
                                    onClick={() => setOpen(open === idx ? null : idx)}
                                >
                                    {benefit.q}
                                    <span aria-hidden="true" className="text-secondary-400 font-bold text-xl transition-transform duration-300 transform">{open === idx ? "−" : "+"}</span>
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