// pages/pacotes/[destinoId]/[pacoteSlug].tsx

import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaPlayCircle, FaChevronLeft, FaChevronRight, FaWhatsapp, FaShareAlt, FaHeart } from "react-icons/fa";
import React, { useRef, useState, useEffect } from 'react';
import { PrismaClient } from '@prisma/client';
import { Pacote } from '../../../types';
import { richTextToHtml } from '../../../utils/richTextToHtml';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const prisma = new PrismaClient();

interface PacotePageProps {
  pacote: Pacote;
}

const isImage = (url: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

export default function PacotePage({ pacote }: PacotePageProps) {
  const router = useRouter();
  const scrollContainer = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [currentLikes, setCurrentLikes] = useState(pacote.like || 0);

  if (router.isFallback) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-primary-800">Carregando...</div>
      </div>
    );
  }

  const formatPrice = (priceInCents: number) => {
    const priceInReals = priceInCents / 100;
    return priceInReals.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const currentMedia = pacote.fotos[0];

  const scroll = (scrollOffset: number) => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollLeft += scrollOffset;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scrollContainer.current) {
      setIsDragging(true);
      setStartX(e.pageX - scrollContainer.current.offsetLeft);
      setScrollLeft(scrollContainer.current.scrollLeft);
      scrollContainer.current.style.cursor = 'grabbing';
      scrollContainer.current.style.userSelect = 'none';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainer.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.current.offsetLeft;
    const walk = (x - startX);
    scrollContainer.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainer.current) {
      scrollContainer.current.style.cursor = 'grab';
      scrollContainer.current.style.userSelect = 'auto';
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollContainer.current) {
        scrollContainer.current.style.cursor = 'grab';
        scrollContainer.current.style.userSelect = 'auto';
      }
    }
  };

  useEffect(() => {
    if (scrollContainer.current) {
      scrollContainer.current.style.cursor = 'grab';
    }
  }, []);

  const handleLike = async () => {
    setCurrentLikes(prev => prev + 1);

    try {
      const response = await fetch('/api/stats/pacote-like', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacoteId: pacote.id }),
      });

      if (!response.ok) {
        // Se a requisição falhar, reverte o estado para o original
        const errorText = await response.text();
        console.error('Erro na API de curtida:', response.status, errorText);
        setCurrentLikes(prev => prev - 1);
        return;
      }

      const data = await response.json();
      if (data.success) {
        localStorage.setItem(`pacote-${pacote.id}-liked`, 'true');
      } else {
        // Se a resposta da API não for de sucesso, reverte o estado
        console.error('Resposta da API sem sucesso:', data);
        setCurrentLikes(prev => prev - 1);
      }
    } catch (error) {
      console.error('Falha ao curtir pacote:', error);
      setCurrentLikes(prev => prev - 1);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pacote.title,
          text: pacote.subtitle || "Confira este incrível pacote de viagem!",
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      alert('Seu navegador não suporta o recurso de compartilhamento nativo. Você pode copiar a URL: ' + window.location.href);
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleWhatsApp = () => {
    const whatsappNumber = "5591981149800";
    const message = encodeURIComponent(`Olá, tenho interesse no pacote "${pacote.title}" (${window.location.href}). Poderia me dar mais informações?`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const availableDates = pacote.dates
    ?.filter(date => new Date(date.saida) >= new Date())
    .sort((a, b) => new Date(a.saida).getTime() - new Date(b.saida).getTime());

  const metaDescription = pacote.subtitle
    ? pacote.subtitle
    : `Descubra o pacote de viagem ${pacote.title} com a D' Hages Turismo. Confira datas, preços e detalhes para sua próxima aventura.`;

  const keywords = `${pacote.title}, ${pacote.subtitle || ''}, D' Hages Turismo, viagens, pacotes turísticos, ${pacote.destinoId.split('-')[0]}, ${pacote.slug}, ${pacote.dates?.[0]?.saida ? format(new Date(pacote.dates[0].saida), 'yyyy', { locale: ptBR }) : ''}`
    .split(',')
    .map(keyword => keyword.trim())
    .filter(keyword => keyword.length > 0)
    .join(', ');

  return (
    <>
      <Head>
        <title>{pacote.title} | D' Hages Turismo</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={`https://seusite.com${router.asPath}`} />
        <meta name="robots" content="index, follow" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="D' Hages Turismo" />
        <meta property="og:title" content={pacote.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={`https://seusite.com${router.asPath}`} />
        <meta property="og:type" content="article" />
        {currentMedia && (
          isImage(currentMedia.url) ? (
            <>
              <meta property="og:image" content={currentMedia.url} />
              <meta property="og:image:width" content="1200" />
              <meta property="og:image:height" content="630" />
              <meta property="og:image:alt" content={`Imagem do pacote de viagem: ${pacote.title}`} />
            </>
          ) : (
            <>
              <meta property="og:image" content={currentMedia.url.replace(/\.(mp4|mov|avi|webm)$/i, '.jpg')} />
              <meta property="og:image:width" content="1200" />
              <meta property="og:image:height" content="630" />
              <meta property="og:image:alt" content={`Vídeo do pacote de viagem: ${pacote.title}`} />
              <meta property="og:video" content={currentMedia.url} />
              <meta property="og:video:type" content="video/mp4" />
              <meta property="og:video:width" content="1280" />
              <meta property="og:video:height" content="720" />
            </>
          )
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pacote.title} />
        <meta name="twitter:description" content={metaDescription} />
        {currentMedia && <meta name="twitter:image" content={currentMedia.url} />}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "${pacote.title}",
              "description": "${metaDescription}",
              "image": "${currentMedia ? currentMedia.url : 'https://seusite.com/images/default-pacote.jpg'}",
              "url": "https://seusite.com${router.asPath}",
              "brand": {
                "@type": "Brand",
                "name": "D' Hages Turismo"
              },
              "offers": {
                "@type": "Offer",
                "priceCurrency": "BRL",
                "price": "${availableDates && availableDates.length > 0 ? (availableDates[0].price / 100).toFixed(2) : '0.00'}",
                "itemCondition": "https://schema.org/NewCondition",
                "availability": "${availableDates && availableDates.length > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}",
                "seller": {
                  "@type": "TravelAgency",
                  "name": "D' Hages Turismo"
                }
              }
            }
          `}
        </script>
      </Head>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative my-6">
            {pacote.fotos.length > 1 && (
              <div className="absolute top-1/2 left-0 right-0 z-10 flex justify-between px-4 sm:px-8 -translate-y-1/2">
                <button
                  onClick={() => scroll(-400)}
                  className="p-2 bg-white rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity"
                  aria-label="Anterior"
                >
                  <FaChevronLeft className="h-6 w-6 text-neutral-800" />
                </button>
                <button
                  onClick={() => scroll(400)}
                  className="p-2 bg-white rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity"
                  aria-label="Próximo"
                >
                  <FaChevronRight className="h-6 w-6 text-neutral-800" />
                </button>
              </div>
            )}
            <div
              ref={scrollContainer}
              className="flex gap-4 overflow-x-scroll scrollbar-hide snap-x snap-mandatory px-4 md:px-0"
              style={{ scrollBehavior: 'smooth' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {pacote.fotos.map((item, index) => (
                <div
                  key={index}
                  className="relative min-w-[80vw] h-[400px] sm:min-w-[60vw] md:min-w-[50vw] lg:min-w-[40vw] xl:min-w-[30vw] snap-center bg-neutral-200 rounded-lg overflow-hidden shadow-md flex-shrink-0"
                >
                  {isImage(item.url) ? (
                    <Image
                      src={item.url}
                      alt={`${pacote.title} - Mídia ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                      priority={index === 0}
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      preload="metadata"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-orange-500 mb-2">{pacote.title}</h1>
            {pacote.subtitle && <p className="text-base sm:text-lg text-neutral-600 mb-4">{pacote.subtitle}</p>}
            <div className="flex items-center gap-4 my-4 flex-wrap">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 bg-red-500 text-white border border-red-500`}
                aria-label="Curtir pacote"
              >
                <FaHeart className='text-white' />
                <span className="font-bold">{currentLikes}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                aria-label="Compartilhar pacote"
              >
                <FaShareAlt />
                <span>Compartilhar</span>
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                aria-label="Falar no WhatsApp"
              >
                <FaWhatsapp />
                <span>Falar no WhatsApp</span>
              </button>
            </div>
            <div className="border-t border-neutral-200 pt-4 mt-6">
              <h3 className="text-lg font-semibold text-primary-800 mb-3 uppercase">Próximas Saídas:</h3>
              {availableDates?.length > 0 ? (
                <div className="flex flex-wrap gap-4 justify-start">
                  {availableDates.map((date, index) => (
                    <div key={index} className="flex flex-col p-4 border border-neutral-300 rounded-lg shadow-sm bg-gray-50 flex-grow-0 flex-shrink-0 min-w-[200px]">
                      <span className="font-bold text-lg text-primary-800 mb-1">
                        Saída: {format(new Date(date.saida), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                      {date.retorno && (
                        <span className="text-sm text-neutral-600 mb-2">
                          Retorno: {format(new Date(date.retorno), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      )}
                      {date.notes && <span className="text-xs text-neutral-500 mb-2"> ({date.notes})</span>}
                      <div className="flex flex-col mt-auto pt-2 border-t border-neutral-200">
                        <span className="text-primary-800 font-bold text-xl">{formatPrice(date.price)}</span>
                        <span className="text-sm text-neutral-600">à vista no Pix</span>
                        <span className="text-sm text-neutral-600">ou <span className="font-medium">{formatPrice(date.price_card)}</span> no cartão</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-neutral-500">Nenhuma data de saída disponível no momento. Entre em contato para mais informações!</p>
              )}
            </div>
            <div className="mt-8 border-t border-neutral-200 pt-4">
              <h3 className="text-lg font-semibold text-primary-800 mb-2 uppercase">Detalhes do Pacote:</h3>
              <div className="prose prose-sm sm:prose-base max-w-none text-neutral-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: richTextToHtml(pacote.description) }} />
            </div>
            <div className="mt-8 border-t border-neutral-200 pt-4">
              <h3 className="text-lg font-semibold text-primary-800 mb-2 uppercase">Nosso Pacote Inclui:</h3>
              <ul className="list-disc list-inside space-y-1 text-neutral-700">
                <li>Transporte em ônibus de turismo</li>
                <li>Hospedagem com café da manhã</li>
                <li>Guia acompanhante D' Hages Turismo</li>
              </ul>
              <h3 className="text-lg font-semibold text-primary-800 mt-6 mb-2 uppercase">Informações Importantes:</h3>
              <ul className="list-disc list-inside space-y-1 text-neutral-700">
                <li>Este roteiro não inclui ingressos para atrações, despesas extras, refeições não mencionadas ou quaisquer outros itens de caráter pessoal.</li>
                <li>A D’ Hages Turismo reserva-se o direito de alterar a ordem da programação e horários, caso necessário, para o bom andamento da excursão, sempre visando a melhor experiência para os passageiros.</li>
                <li>A D’ Hages não se responsabiliza por alterações de valores, horários e funcionamento de atrativos turísticos citados no roteiro, que são de responsabilidade de terceiros.</li>
                <li>As poltronas do ônibus serão reservadas conforme a ordem de compra e informadas no ato do embarque. Sugerimos chegar com antecedência.</li>
                <li>Este roteiro está sujeito a reajustes de valores sem aviso prévio. Confirme o preço no momento da reserva.</li>
                <li>Reservas só serão garantidas mediante confirmação integral de pagamento ou parcelamento acordado.</li>
                <li>Parcelamentos em dinheiro ou depósito bancário devem estar quitados integralmente até 20 dias antes da data de saída da viagem.</li>
                <li>Hospedagens iniciam geralmente às 14h. Entrada antecipada (check-in early) somente se houver disponibilidade no hotel e poderá ter custo adicional.</li>
                <li>A acomodação no hotel poderá ser em Apartamento Duplo, Triplo ou Quádruplo, de acordo com a estrutura do hotel/pousada contratado e o número de participantes.</li>
                <li>A acomodação em Apartamento Duplo será preferencialmente para casais ou viajantes em dupla, de acordo com a disponibilidade do hotel.</li>
                <li>Documentação exigida para hospedagem de menor: Conforme previsto no Estatuto da Criança e do Adolescente (Lei 8.069/90, arts. 82 e 250), é proibida a hospedagem em hotel, pousadas e similares de CRIANÇAS ou ADOLESCENTES, menores de 18 anos, desacompanhados de pais ou responsáveis legais. É necessário que todas as Crianças e Adolescentes apresentem seus documentos de identidade (RG) ou certidão de nascimento no Check-In.
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-1">
                    <li>Se acompanhado de pai e/ou mãe: certidão de nascimento, cédula de identidade ou passaporte.</li>
                    <li>Se desacompanhado de pai e/ou mãe (ou outros responsáveis legais): Autorização formal para hospedagem, assinada por pai e mãe, com firma reconhecida em cartório, ou autorização judicial.</li>
                  </ul>
                </li>
                <li>Favor ler o contrato de prestação de serviços turísticos que rege a compra deste produto para todas as condições detalhadas.</li>
              </ul>

              <h3 className="text-lg font-semibold text-primary-800 mt-6 mb-2 uppercase">Informações e Reservas:</h3>
              <div className="text-sm text-neutral-700 space-y-1">
                <p><strong>D’ HAGES TURISMO</strong></p>
                <p>Trav. Mauriti, 479 (entre Rua Nova e Senador Lemos) - Belém – Pará – Brasil - CEP: 66083-000</p>
                <p>E-mail: <a href="mailto:dhagesturismo@gmail.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">dhagesturismo@gmail.com</a></p>
                <p><a href="https://www.facebook.com/dhagesturismo" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook.com/dhagesturismo</a></p>
                <p>Instagram: <a href="https://www.instagram.com/dhages_turismo" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@dhages_turismo</a></p>
                <p>Fones/WhatsApp: <a href="https://wa.me/559133485063" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">91 3348-5063</a> / <a href="https://wa.me/5591981149800" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">91 98114-9800</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const pacotes = await prisma.pacote.findMany({
    select: {
      slug: true,
      destino: {
        select: {
          id: true,
        },
      },
    },
  });

  const paths = pacotes.map(pacote => ({
    params: {
        destinoId: `norte-${pacote.destino.id}`,
        pacoteSlug: pacote.slug
    },
  }));

  return {
    paths,
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { destinoId, pacoteSlug } = params as { destinoId: string; pacoteSlug: string };
  const destinoIdReal = destinoId.split('-')[1];

  const pacote = await prisma.pacote.findUnique({
    where: {
      slug: pacoteSlug,
      destino: {
        id: destinoIdReal,
      }
    },
    include: {
      fotos: true,
      dates: {
        orderBy: {
          saida: 'asc',
        },
      },
    },
  });

  if (!pacote) {
    return { notFound: true };
  }

  const serializedPacote = {
    ...pacote,
    createdAt: pacote.createdAt?.toISOString() || null,
    updatedAt: pacote.updatedAt?.toISOString() || null,
    dates: pacote.dates.map(date => ({
      ...date,
      createdAt: date.createdAt.toISOString(),
      updatedAt: date.updatedAt.toISOString(),
      saida: date.saida.toISOString(),
      retorno: date.retorno?.toISOString() || null,
    })),
    fotos: pacote.fotos.map(foto => ({
      ...foto,
      createdAt: foto.createdAt.toISOString(),
      updatedAt: foto.updatedAt.toISOString(),
    })),
  };

  return {
    props: { pacote: serializedPacote },
    revalidate: 60,
  };
};