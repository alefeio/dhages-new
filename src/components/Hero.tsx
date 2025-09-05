// src/components/Hero.tsx

import Link from "next/link";
import { useRouter } from "next/router";

export default function Hero() {
  const router = useRouter();

  const handleClick = (pg: string) => {
    router.push(pg);
  };

  return (
    <header className="relative w-full h-[600px] flex items-center justify-center text-center overflow-hidden">
      {/* Background com imagem e overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero-dhages.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
      </div>

      {/* Conteúdo do Hero */}
      <div className="relative z-10 max-w-xs md:max-w-7xl mx-auto px-4">
        <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 text-primary-900 drop-shadow-md">
          D'Hages Turismo
        </h1>
        {/* Círculo com borda amarela para o texto */}
        <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-secondary-400 text-primary-950 font-bold flex items-center justify-center mx-auto mb-6 shadow-xl">
          <p className="font-serif text-xl md:text-2xl text-primary-900">
            Sua jornada <br /> começa aqui!
          </p>
        </div>

        <p className="text-xl md:text-2xl mt-4 px-2 text-neutral-800 drop-shadow-md">
          <strong>Especialistas em excursões pelo Norte e Nordeste</strong>, oferecemos <strong>viagens em família</strong> com todo o conforto e qualidade que você merece.
        </p>
        <p className="text-lg md:text-xl mt-2 px-2 text-neutral-700 drop-shadow-md">
          Embarque em uma aventura inesquecível por destinos como os Lençóis Maranhenses, Jericoacoara e as melhores praias do Nordeste.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center mt-12">
          <a
            href="#destinos"
            className="inline-flex items-center justify-center bg-secondary-400 hover:bg-secondary-500 text-primary-950 rounded-full shadow-lg py-3 px-8 font-bold text-lg transition-colors duration-300 transform hover:scale-105"
            onClick={(e) => {
              e.preventDefault();
              const section = document.getElementById('destinos');
              section?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Explore nossos destinos de viagem"
          >
            Explore nossos Roteiros
          </a>
          <a
            href="https://wa.me//5591985810208?text=Olá! Gostaria de mais informações sobre os pacotes de viagem."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-transparent border-2 border-primary-600 hover:bg-primary-600 hover:text-white rounded-full shadow-lg py-3 px-8 font-bold text-lg transition-colors duration-300 transform hover:scale-105"
            aria-label="Fale conosco pelo WhatsApp"
          >
            Fale com nossa equipe
          </a>
        </div>
      </div>
    </header>
  );
}