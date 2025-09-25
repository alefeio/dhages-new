// src/components/LocationMap.tsx

import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { FaFacebook, FaInstagram } from 'react-icons/fa'; // Importe os ícones

export default function LocationMap() {
    const router = useRouter();

    const handleClick = (pg: string) => {
        router.push(pg);
    };

    // Dados atualizados da D'Hages Turismo
    const address = "Av. Senador Lemos, 3153, lojas 30/31 - 1º piso, It Center - Sacramenta - Belém/PA";
    const phone = "(91) 98114-9800";
    // O link do mapa que funciona na sua versão anterior
    const googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.620020138243!2d-48.47271032598379!3d-1.455243098555913!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x92a48e71861a3577%3A0x6b49c7161b979502!2sTv.%20Mauriti%2C%20479%20-%20Pedreira%2C%20Bel%C3%A9m%20-%20PA%2C%2066087-740!5e0!3m2!1spt-BR!2sbr!4v1700676451000!5m2!1spt-BR!2sbr";
    const whatsappLink = `https://wa.me/5591981149800?text=Olá, D'Hages! Gostaria de mais informações. Estou entrando em contato através do site.`;
    const instagramLink = "https://www.instagram.com/dhages_turismo/";
    const facebookLink = "https://www.facebook.com/dhagesturismo";

    return (
        <>
            <section className="relative mx-auto w-full px-4 overflow-hidden">
                <div id="localizacao" className="py-16"> </div>
                {/* Imagem de fundo usando next/image para otimização */}
                <div className="absolute inset-0 w-full h-full">
                    <Image
                        src="/images/frota1.jpeg" // Caminho da imagem que você forneceu
                        alt="Background da D'Hages Turismo"
                        layout="fill"
                        objectFit="cover"
                        quality={80}
                        priority
                    />
                </div>

                {/* Sobreposição para escurecer a imagem e melhorar a legibilidade */}
                <div className="absolute inset-0 bg-black opacity-50"></div>

                {/* Conteúdo do componente */}
                <div className="relative z-10 py-16 text-white">
                    <div className="mb-12 text-center">
                        <h2 className="text-white font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-md">
                            Onde Estamos
                        </h2>
                        <p className="text-white text-lg max-w-2xl mx-auto">
                            Visite nossa agência para planejar sua próxima aventura.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row md:justify-center md:gap-8 items-center md:items-start">
                        {/* Mapa - Reduzido */}
                        <div className="w-full h-72 md:w-1/2 rounded-xl overflow-hidden shadow-lg mb-6 md:mb-0">
                            <iframe
                                title="Localização da D' Hages Turismo em Belém"
                                src={googleMapsEmbedUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>

                        {/* Informações de Contato e Redes Sociais */}
                        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                            <address className="not-italic mb-6">
                                <span className="font-semibold text-lg block">D' Hages Turismo</span>
                                <span className="block">{address}</span>
                                <span className="block">Horário de funcionamento: das 08:00 às 18:00</span>
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={whatsappLink}
                                    className="text-secondary-400 hover:text-secondary-600 font-semibold transition-colors underline block mt-2"
                                    onClick={() => handleClick('/whatsapp')}
                                >
                                    Fale com a gente no WhatsApp: {phone}
                                </a>
                            </address>

                            {/* Links para Redes Sociais */}
                            <div className="flex gap-4 mb-4">
                                <a href={instagramLink} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                    <FaInstagram className="text-white hover:text-secondary-400 transition-colors" size={32} />
                                </a>
                                <a href={facebookLink} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                    <FaFacebook className="text-white hover:text-secondary-400 transition-colors" size={32} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}