// pages/index.tsx
import { PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Script from 'next/script';
import HeroSlider from '../components/HeroSlider';
import WhatsAppButton from '../components/WhatsAppButton';
import PacotesGallery from '../components/PacotesGallery';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import LocationMap from '../components/LocationMap';
import Header from 'components/Header';
import { Menu as MenuComponent } from 'components/Menu';
import Hero from 'components/Hero';
import { Analytics } from "@vercel/analytics/next";
import { HomePageProps, Destino } from '../types/index';
import PromotionsForm from 'components/PromotionsForm';
import { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import Footer from 'components/Footer';

// FUNÇÃO SLUGIFY
function slugify(text: string): string {
    return text.toString().toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
    try {
        const [banners, menus, testimonials, faqs, destinos] = await Promise.all([
            prisma.banner.findMany(),
            prisma.menu.findMany(),
            prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.fAQ.findMany({ orderBy: { pergunta: 'asc' } }),
            prisma.destino.findMany({
                orderBy: { order: 'asc' },
                include: { pacotes: { include: { fotos: true, dates: true } } },
            }),
        ]);

        const destinosComSlugs: Destino[] = destinos.map((destino: any) => ({
            ...destino,
            slug: slugify(`${destino.title}-${destino.id}`),
            pacotes: destino.pacotes.map((pacote: any) => ({
                ...pacote,
                slug: slugify(`${pacote.title}-${pacote.id}`),
            })),
        }));

        const menu: any | null = menus.length > 0 ? menus[0] : null;

        return {
            props: {
                banners: JSON.parse(JSON.stringify(banners)),
                menu: JSON.parse(JSON.stringify(menu)),
                testimonials: JSON.parse(JSON.stringify(testimonials)),
                faqs: JSON.parse(JSON.stringify(faqs)),
                destinos: JSON.parse(JSON.stringify(destinosComSlugs)),
            },
        };
    } catch (error) {
        console.error("Erro ao buscar dados do banco de dados:", error);
        return {
            props: {
                banners: [],
                menu: null,
                testimonials: [],
                faqs: [],
                destinos: [],
            },
        };
    } finally {
        await prisma.$disconnect();
    }
};

export default function Home({ banners, menu, testimonials, faqs, destinos }: HomePageProps) {
    const [showExitModal, setShowExitModal] = useState(false);

    console.log('Banners:', banners);

    useEffect(() => {
        const modalShownInSession = sessionStorage.getItem('exitModalShown');

        const handleMouseLeave = (e: MouseEvent) => {
            if (!modalShownInSession) {
                setShowExitModal(true);
                sessionStorage.setItem('exitModalShown', 'true');
            }
        };

        if (typeof window !== 'undefined') {
            document.documentElement.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            if (typeof window !== 'undefined') {
                document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);

    // Definir uma imagem padrão para Open Graph na página inicial
    // Adapte esta URL para uma imagem que represente bem a D' Hages Turismo
    const defaultOgImage = banners.length > 0 && banners[0].banners[0].url 
        ? banners[0].banners[0].url // Usa a primeira imagem do banner se disponível
        : 'https://seusite.com/default-og-image.jpg'; // URL de uma imagem padrão do seu site

    const defaultOgImageAlt = "D' Hages Turismo - Sua agência de viagens em Belém";

    return (
        <>
            <Head>
                {/* Título da Página (muito importante para SEO) */}
                <title>D' Hages Turismo | Agência de Viagens em Belém - Pacotes e Destinos</title>
                
                {/* Meta Description (crucial para SEO - aparece nos resultados da busca) */}
                <meta 
                    name="description" 
                    content="Descubra os melhores pacotes de viagens e destinos com a D' Hages Turismo em Belém. Aventuras memoráveis, atendimento personalizado e as melhores ofertas para sua próxima viagem." 
                />
                
                {/* Meta Keywords (menos importante hoje, mas pode ser incluído) */}
                <meta 
                    name="keywords" 
                    content="D' Hages Turismo, viagens, pacotes de viagens, Belém, Pará, destinos turísticos, agência de viagens, excursões, aventura, turismo" 
                />
                
                {/* Canonical URL (ajuda a evitar conteúdo duplicado e consolidar o link) */}
                <link rel="canonical" href="https://seusite.com/" /> {/* Substitua "https://seusite.com" pela URL raiz do seu site */}
                
                {/* Robots Meta Tag (instrui os motores de busca sobre como indexar a página) */}
                <meta name="robots" content="index, follow" />

                {/* Open Graph Tags (para compartilhamento em redes sociais como Facebook, WhatsApp, LinkedIn) */}
                <meta property="og:locale" content="pt_BR" />
                <meta property="og:site_name" content="D' Hages Turismo" />
                <meta property="og:title" content="D' Hages Turismo | Agência de Viagens em Belém - Pacotes e Destinos" />
                <meta 
                    property="og:description" 
                    content="Descubra os melhores pacotes de viagens e destinos com a D' Hages Turismo em Belém. Aventuras memoráveis, atendimento personalizado e as melhores ofertas para sua próxima viagem." 
                />
                <meta property="og:url" content="https://seusite.com/" /> {/* Substitua "https://seusite.com" */}
                <meta property="og:type" content="website" /> {/* Página inicial geralmente é "website" */}
                
                {/* Imagem principal para Open Graph */}
                <meta property="og:image" content={defaultOgImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content={defaultOgImageAlt} />
                
                {/* Twitter Card Tags (para compartilhamento no Twitter) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="D' Hages Turismo | Agência de Viagens em Belém - Pacotes e Destinos" />
                <meta 
                    name="twitter:description" 
                    content="Descubra os melhores pacotes de viagens e destinos com a D' Hages Turismo em Belém. Aventuras memoráveis, atendimento personalizado e as melhores ofertas para sua próxima viagem." 
                />
                <meta name="twitter:image" content={defaultOgImage} />
                <meta name="twitter:image:alt" content={defaultOgImageAlt} />

                {/* Schema Markup (JSON-LD) para o Google - Ajuda a enriquecer os resultados de busca */}
                <script type="application/ld+json">
                  {`
                    {
                      "@context": "https://schema.org",
                      "@type": "TravelAgency",
                      "name": "D' Hages Turismo",
                      "url": "https://seusite.com/",
                      "logo": "https://seusite.com/images/logo-dhages.png", // Substitua pela URL do seu logo
                      "description": "Sua agência de viagens em Belém, Pará. Especializada em pacotes turísticos e destinos memoráveis.",
                      "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Trav. Mauriti, 479",
                        "addressLocality": "Belém",
                        "addressRegion": "PA",
                        "postalCode": "66083-000",
                        "addressCountry": "BR"
                      },
                      "contactPoint": {
                        "@type": "ContactPoint",
                        "telephone": "+559133485063",
                        "contactType": "Sales"
                      },
                      "sameAs": [
                        "https://facebook.com/dhagesturismo",
                        "https://www.instagram.com/dhages_turismo"
                        // Adicione outras URLs de redes sociais aqui
                      ]
                    }
                  `}
                </script>
            </Head>

            <div className="min-h-screen">
                <Analytics />
                <MenuComponent menuData={menu} />
                <HeroSlider banners={banners} />
                <main className="max-w-full mx-auto">
                    <Hero />
                    <PacotesGallery destinos={destinos} />
                    <Header />
                    <PromotionsForm />
                    <Testimonials testimonials={testimonials} />
                    <FAQ faqs={faqs} />
                    {/* <LocationMap /> Se você tiver um mapa de localização para a página inicial, inclua aqui */}
                    <Footer menuData={menu} />
                </main>
                <WhatsAppButton />
            </div>

            {/* {showExitModal && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowExitModal(false); }}
                >
                    <div
                        className="bg-primary-200 relative rounded-lg shadow-xl p-6 m-4 max-w-lg w-full transform transition-all duration-300 scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowExitModal(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Fechar"
                        >
                            <AiOutlineClose size={24} />
                        </button>
                        <PromotionsForm />
                    </div>
                </div>
            )} */}
        </>
    );
}