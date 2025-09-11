// pages/share/[destinoSlug]/index.tsx
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Destino, Pacote } from 'types';
import { FaWhatsapp, FaHome } from 'react-icons/fa';

interface DestinoShareProps {
  destino: Destino;
  shareBaseUrl: string;
}

export const getServerSideProps: GetServerSideProps<DestinoShareProps> = async (
  context: GetServerSidePropsContext
) => {
  const { destinoSlug } = context.params as { destinoSlug: string };

  const API_URL = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/crud/destinos`
    : 'http://localhost:3000/api/crud/destinos';

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Failed to fetch destinos: Status ${res.status}`);

    const data = await res.json();
    const destinos: Destino[] = data.destinos;

    const destino = destinos.find(d => d.slug === destinoSlug);
    if (!destino) return { notFound: true };

    const protocol = context.req.headers['x-forwarded-proto'] || 'http';
    const host = context.req.headers.host;
    const shareBaseUrl = `${protocol}://${host}/share/${destinoSlug}`;

    return {
      props: { destino, shareBaseUrl },
    };
  } catch (error) {
    console.error('Error fetching data for destino page:', error);
    return { notFound: true };
  }
};

export default function DestinoSharePage({ destino, shareBaseUrl }: DestinoShareProps) {
  if (!destino) return <div>Destino não encontrado.</div>;

  const handleWhatsappClick = (pacote: Pacote) => {
    const whatsappMessage = `Olá! Gostaria de reservar o pacote ${pacote.title} do destino ${destino.title}. Link: ${shareBaseUrl}/${pacote.slug}`;
    const whatsappUrl = `https://wa.me/5591981149800?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-primary-100 min-h-screen flex flex-col items-center p-4">
      <Head>
        <title>{destino.title}</title>
        <meta name="description" content={`Confira todos os pacotes do destino ${destino.title}.`} />
        <meta property="og:title" content={destino.title} />
        <meta property="og:description" content={`Confira todos os pacotes do destino ${destino.title}.`} />
        <meta property="og:image" content={destino.image || destino.pacotes[0]?.fotos[0]?.url || ''} />
        <meta property="og:url" content={shareBaseUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={destino.title} />
        <meta name="twitter:image" content={destino.image || destino.pacotes[0]?.fotos[0]?.url || ''} />
      </Head>

      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-6">{destino.title}</h1>
        {destino.subtitle && <p className="text-center text-gray-600 mb-6">{destino.subtitle}</p>}

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {destino.pacotes.map((pacote) => (
            <div key={pacote.id} className="bg-primary-200 rounded-lg shadow-md overflow-hidden">
              <div className="relative w-full h-64">
                <img
                  src={pacote.fotos[0]?.url || destino.image || ''}
                  alt={pacote.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex flex-col items-center">
                <h2 className="text-xl font-bold mb-1">{pacote.title}</h2>
                {pacote.subtitle && <p className="text-sm text-gray-600 mb-2">{pacote.subtitle}</p>}
                <p className="text-sm text-gray-700 mb-4">{pacote.description}</p>

                <div className="flex space-x-4">
                  <button
                    onClick={() => handleWhatsappClick(pacote)}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
                  >
                    <FaWhatsapp className="text-white" />
                    <span>Reservar</span>
                  </button>
                  <Link
                    href={`/share/${destino.slug}/${pacote.slug}`}
                    className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
                  >
                    <FaHome className="text-white" />
                    <span>Detalhes</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
