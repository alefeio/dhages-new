import Link from "next/link";
import { useRouter } from "next/router";

export default function Hero() {
  const router = useRouter();

  const handleClick = (pg: string) => {
    router.push(pg);
  };

  return (
    <header className="my-16 text-center max-w-xs md:max-w-7xl mx-auto">
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
        Alugue seu vestido na My Dress
      </h1>
      <p className="px-2 border-t-2 border-textcolor-200 mb-4 w-fit m-auto pt-6">
        <strong>Na My Dress</strong>, você encontra muito mais do que uma vitrine física — <strong>temos um catálogo digital completo e sempre atualizado</strong>.
      </p>
      <p className="px-2">
        Aqui você pode <strong>visualizar os modelos disponíveis, explorar por cores, tamanhos e estilos</strong> antes mesmo de vir até a loja.
      </p>
      <a
        href="https://wa.me//5591985810208?text=Olá! Gostaria de solicitar o catálogo."
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center mx-auto mt-12 bg-background-300 hover:bg-background-200 rounded-full shadow-lg py-3 px-8 font-bold text-lg transition-colors duration-300"
        onClick={() => handleClick('/agendar-visita')}
        aria-label="Solicitar catálogo"
      >
        Solicite nosso Catálogo
      </a>
      <div>
        E <Link
          href="#fique-por-dentro"
          className="inline-flex mt-12 font-bold transition-colors duration-300"
          aria-label="Fique por dentro"
        >
          Cadastre-se
        </Link> para receber novidades sobre nossos lançamentos e descontos exclusivos.
      </div>
    </header>
  )
}