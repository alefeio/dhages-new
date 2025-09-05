// src/components/Header.tsx

import { useState } from "react"
import Link from "next/link";

const faqs = [
    {
        q: "Qualidade e Conforto",
        a: [
            "Frota de veículos modernos e equipados com ar condicionado e Wi-Fi para o seu conforto.",
            "Nossos roteiros são planejados para otimizar seu tempo e proporcionar a melhor experiência.",
            "Seleção de pousadas e hotéis que priorizam seu bem-estar e descanso."
        ]
    },
    {
        q: "Segurança e Confiabilidade",
        a: [
            "Operamos com guias experientes e cadastrados, garantindo total segurança.",
            "Nossa agência é credenciada e possui anos de experiência no mercado de turismo.",
            "Suporte completo antes, durante e depois da sua viagem, a qualquer hora."
        ]
    },
    {
        q: "Viagens para Famílias",
        a: [
            "Oferecemos pacotes de viagem completos e seguros para todas as idades.",
            "Criamos experiências memoráveis para que você e sua família criem laços e boas recordações.",
            "Nossos roteiros são pensados para atender às necessidades de crianças e adultos."
        ]
    }
]

export default function Header() {
    const [open, setOpen] = useState<number | null>(null)
    return (
        <>
            <div id="empresa">&nbsp;</div>
            <aside className="relative my-16 md:max-w-6xl mx-auto rounded-xl overflow-hidden shadow-2xl">
                {/* Imagem de fundo para a seção "Sobre a Empresa" */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('/images/bg-hero.jpg')", // Use a imagem dos Lençóis Maranhenses
                    }}
                >
                    {/* Overlay para desfocar e clarear a imagem de fundo, garantindo legibilidade */}
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
                </div>

                {/* Conteúdo principal da seção, com z-index maior */}
                <div className="relative z-10 w-full mx-auto p-4 bg-white/80 rounded-xl"> {/* Adicionado bg-white/80 para melhor contraste */}
                    <div className="mb-6 text-center md:max-w-4xl mx-auto px-4">
                        <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-16 text-primary-900">
                            Explore o Brasil com a <br />
                            <span className="text-xl md:text-2xl font-normal block mt-2 text-primary-600">D'Hages Turismo: Sua Agência de Viagens em Belém</span>
                        </h2>
                        <p className="border-t-2 border-secondary-400 py-6 text-neutral-700">
                            **Desde 2015, a D’Hages Turismo é sua parceira ideal para excursões pelo Brasil**, com foco em **viagens econômicas, rápidas e cheias de conforto e segurança**.
                        </p>
                    </div>

                    <div className="md:flex gap-8 px-4 items-start">
                        <div className="rounded-xl mx-auto md:mx-0 flex-1 shadow-lg"> {/* Adicionado sombra para o vídeo */}
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
                            <h1 className="rounded-xl font-serif text-2xl md:text-3xl font-bold mb-4 mt-8 md:mt-0 text-neutral-50 bg-primary-600 px-4 py-2 shadow-md">
                                Da riqueza natural do Pará aos encantos do Nordeste, sua aventura começa aqui.
                            </h1>
                            <p className="my-8 text-neutral-800">
                                Com foco em **roteiros pelo Norte e Nordeste**, somos especialistas em criar experiências inesquecíveis, como **excursões para os Lençóis Maranhenses e viagens para Jericoacoara**, que cabem no seu bolso e no seu tempo.
                            </p>
                            <p className="my-8 text-neutral-800">
                                Nossa missão é simplificar sua viagem, oferecendo **viagens em família** e passeios que combinam **qualidade, segurança e o melhor custo-benefício** para você focar apenas em aproveitar.
                            </p>

                            {faqs.map((faq, idx) => (
                                <div key={idx} className="mb-4 border-b border-primary-100 bg-primary-50 px-4 rounded-xl shadow-sm">
                                    <button
                                        id={`faq-button-${idx}`}
                                        aria-expanded={open === idx}
                                        aria-controls={`faq-panel-${idx}`}
                                        className="w-full flex justify-between items-center py-4 text-left font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:ring-offset-2 rounded text-primary-800"
                                        onClick={() => setOpen(open === idx ? null : idx)}
                                    >
                                        {faq.q}
                                        <span aria-hidden="true" className="text-secondary-400 font-bold text-xl">{open === idx ? "−" : "+"}</span>
                                    </button>
                                    <div
                                        id={`faq-panel-${idx}`}
                                        role="region"
                                        aria-labelledby={`faq-button-${idx}`}
                                        className={`overflow-hidden transition-all duration-300 ${open === idx ? "max-h-60" : "max-h-0"}`}
                                    >
                                        {faq.a.map((topic: string, i: number) => (
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
            </aside>
        </>
    )
}