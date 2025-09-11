// pages/share/[destinoSlug]/[pacoteSlug].tsx

import Head from 'next/head';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Destino, Pacote } from '../../../types';
import { FaWhatsapp, FaHome } from 'react-icons/fa';

interface ShareProps {
  pacote: Pacote;
  destinoTitle: string;
  shareUrl: string;
}

export const getServerSideProps: GetServerSideProps<ShareProps> = async (
  context: GetServerSidePropsContext
) => {
  const { destinoSlug, pacoteSlug } = context.params as {
    destinoSlug: string;
    pacoteSlug: string;
  };

  const API_URL = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/crud/destinos`
    : 'http://localhost:3000/api/crud/destinos';

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Failed to fetch destinos: Status ${res.status}`);

    const data = await res.json();
    const destinos: Destino[] = data.destinos;

    const currentDestino = destinos.find(d => d.slug === destinoSlug);
    if (!currentDestino) return { notFound: true };

    const pacote = currentDestino.pacotes.find(p => p.slug === pacoteSlug);
    if (!pacote) return { notFound: true };

    const host = context.req.headers.host;
    const protocol = context.req.headers['x-forwarded-proto'] || 'http';
    const shareUrl = `${protocol}://${host}/share/${destinoSlug}/${pacoteSlug}`;

    return {
      props: {
        pacote,
        destinoTitle: currentDestino.title,
        shareUrl,
      },
    };
  } catch (error) {
    console.error('Error fetching data for share page:', error);
    return { notFound: true };
  }
};

const SharePage = ({ pacote, destinoTitle, shareUrl }: ShareProps) => {
  if (!pacote) return <div>Pacote não encontrado.</div>;

  const handleWhatsappClick = () => {
    const whatsappMessage = `Olá! Gostaria de reservar o pacote ${pacote.title}. Link para mais detalhes: ${shareUrl}`;
    const whatsappUrl = `https://wa.me/5591981149800?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-primary-100 min-h-screen flex items-center justify-center p-4">
      <Head>
        <title>{`${pacote.title} - ${destinoTitle}`}</title>
        <meta
          name="description"
          content={`Confira este pacote do destino ${destinoTitle}. Pacote: ${pacote.title}.`}
        />
        <meta property="og:title" content={`${pacote.title} - ${destinoTitle}`} />
        <meta property="og:description" content={`Confira este pacote do destino ${destinoTitle}.`} />
        <meta property="og:image" content={pacote.fotos[0]?.url || ''} />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${pacote.title} - ${destinoTitle}`} />
        <meta name="twitter:image" content={pacote.fotos[0]?.url || ''} />
      </Head>

      <div className="w-full max-w-xl bg-primary-200 rounded-lg shadow-lg overflow-hidden md:max-w-xl">
        <div className="p-4 bg-primary-200 text-center">
          <h1 className="text-xl font-bold">{pacote.title}</h1>
          {pacote.subtitle && <p className="text-sm text-gray-600">{pacote.subtitle}</p>}
        </div>

        <div className="relative w-full h-auto">
          <img
            src={pacote.fotos[0]?.url || ''}
            alt={pacote.title}
            className="w-full h-auto object-contain"
          />
        </div>

        <div className="p-4 flex flex-col items-center">
          <p className="text-center text-sm text-gray-700 mb-4">{pacote.description}</p>
          <div className="flex space-x-4">
            <button
              onClick={handleWhatsappClick}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
            >
              <FaWhatsapp className="text-white" />
              <span>Reservar</span>
            </button>
            <a
              href="/"
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
            >
              <FaHome className="text-white" />
              <span>Site</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
