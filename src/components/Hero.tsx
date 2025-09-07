// src/components/Hero.tsx

import Image from "next/image";
import { useRouter } from "next/router";
import { FaWhatsapp } from 'react-icons/fa';

export default function Hero() {
  const router = useRouter();

  const handleClick = (pg: string) => {
    router.push(pg);
  };

  return (
    <header className="relative w-full h-[650px] flex items-center justify-center overflow-hidden bg-primary-950">
      {/* Bloco de cor diagonal para o design criativo */}
      <div className="absolute top-0 right-0 w-3/5 h-full bg-primary-600 transform -skew-x-12 origin-top-right"></div>
      <div className="absolute top-0 right-0 w-3/5 h-full bg-primary-700 opacity-60 transform -skew-x-12 origin-top-right"></div>

      {/* Conteúdo principal da seção */}
      <div className="relative z-10 max-w-xs md:max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center md:items-start text-white">
        <div className="md:w-3/5 text-center md:text-left">
          <h1 className="font-serif text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight">
            Sua Aventura de Viagem Começa Aqui
          </h1>
          
          <p className="text-xl md:text-2xl mt-4 px-2 md:px-0 drop-shadow-lg font-light">
            A **D'Hages Turismo** é sua **agência de viagens em Belém - PA**, especializada em **excursões e pacotes de viagem pelo Brasil todo**.
          </p>
          
          <p className="text-lg md:text-xl mt-2 px-2 md:px-0 drop-shadow-lg font-light">
            Descubra roteiros inesquecíveis nos **Lençóis Maranhenses**, em **Jericoacoara** e nas paradisíacas praias do Nordeste, tudo com a segurança e o conforto que sua **família** merece.
          </p>
          
          {/* Botões de Ação */}
          <div className="flex flex-col md:flex-row gap-4 mt-12 md:justify-start justify-center">
            <a
              href="#destinos"
              className="inline-flex items-center justify-center bg-secondary-400 hover:bg-secondary-500 text-primary-950 rounded-full shadow-lg py-3 px-8 font-bold text-lg transition-colors duration-300 transform hover:scale-105"
              onClick={(e) => {
                e.preventDefault();
                const section = document.getElementById('destinos');
                section?.scrollIntoView({ behavior: 'smooth' });
              }}
              aria-label="Explore nossos pacotes de viagem"
            >
              Explore Nossos Pacotes
            </a>
            <a
              href="https://wa.me/5591985810208?text=Olá! Gostaria de mais informações sobre os pacotes de viagem."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-transparent border-2 border-white hover:bg-white hover:text-primary-950 text-white rounded-full shadow-lg py-3 px-8 font-bold text-lg transition-colors duration-300 transform hover:scale-105"
              aria-label="Fale conosco pelo WhatsApp"
            >
              <FaWhatsapp className="mr-2" />
              Fale com nossa equipe
            </a>
          </div>
        </div>

        {/* Espaço para a logo da D'Hages no layout (removido temporariamente para o exemplo) */}
        <div className="hidden md:block md:w-2/5">
          <Image src="/logo.png" alt="D'Hages Turismo Logo" width={200} height={200} />
        </div>
      </div>
    </header>
  );
}