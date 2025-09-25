import { PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Script from 'next/script';
import HeroSlider from '../components/HeroSlider';
import WhatsAppButton from '../components/WhatsAppButton';
import PacotesGallery from '../components/PacotesGallery';
import GalleryPhotos from '../components/GalleryPhotos'; // Importação do componente de galeria
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import LocationMap from '../components/LocationMap';
import Header from 'components/Header';
import { Menu as MenuComponent } from 'components/Menu';
import Hero from 'components/Hero';
import { Analytics } from "@vercel/analytics/next";
import { HomePageProps, Destino } from '../types/index';
// Importe a interface de galeria do arquivo correto
import { Gallery } from '../types/gallery';
import PromotionsForm from 'components/PromotionsForm';
import { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import Footer from 'components/Footer';

// Estendendo a interface HomePageProps para incluir as galerias
interface HomePagePropsExtended extends HomePageProps {
    galleries: Gallery[];
}

// FUNÇÃO SLUGIFY
function slugify(text: string): string {
    return text.toString().toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/-+$/, '');
}

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps<HomePagePropsExtended> = async () => {
    try {
        const [banners, menus, testimonials, faqs, destinos, galleries] = await Promise.all([
            prisma.banner.findMany(),
            prisma.menu.findMany(),
            prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.fAQ.findMany({ orderBy: { pergunta: 'asc' } }),
            prisma.destino.findMany({
                orderBy: { order: 'asc' },
                include: { pacotes: { include: { fotos: true, dates: true } } },
            }),
            prisma.gallery.findMany({ include: { photos: true } }),
        ]);

        const destinosComSlugs: Destino[] = destinos.map((destino: any) => ({
            ...destino,
            slug: slugify(`${destino.title}-${destino.id}`),
            pacotes: destino.pacotes.map((pacote: any) => ({
                ...pacote,
                slug: slugify(`${pacote.title}-${pacote.id}`),
            })),
        }));

        const galleriesWithSlugs: Gallery[] = galleries.map((gallery) => ({
            ...gallery,
            slug: slugify(gallery.title)
        }));

        const menu: any | null = menus.length > 0 ? menus[0] : null;

        return {
            props: {
                banners: JSON.parse(JSON.stringify(banners)),
                menu: JSON.parse(JSON.stringify(menu)),
                testimonials: JSON.parse(JSON.stringify(testimonials)),
                faqs: JSON.parse(JSON.stringify(faqs)),
                destinos: JSON.parse(JSON.stringify(destinosComSlugs)),
                galleries: JSON.parse(JSON.stringify(galleriesWithSlugs)),
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
                galleries: [],
            },
        };
    } finally {
        await prisma.$disconnect();
    }
};

export default function Home({ banners, menu, testimonials, faqs, destinos, galleries }: HomePagePropsExtended) {
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

    const defaultOgImage = banners.length > 0 && banners[0].banners[0].url
        ? banners[0].banners[0].url
        : 'https://seusite.com/default-og-image.jpg';

    const defaultOgImageAlt = "D' Hages Turismo - Sua agência de viagens em Belém";

    return (
        <>
            <Head>
                <title>D' Hages Turismo | Agência de Viagens em Belém - Pacotes e Destinos</title>
                <meta
                    name="description"
                    content="Descubra os melhores pacotes de viagens e destinos com a D' Hages Turismo em Belém. Aventuras memoráveis, atendimento personalizado e as melhores ofertas para sua próxima viagem. Viaje com a D' Hages Turismo para Salinas, Lençóis Maranhenses, Carolina-MA, São Luís, Fortaleza, Jericoacoara, Marajó, Ajuruteua, Algodoal, Nordeste e muito mais!"
                />
                <meta
                    name="keywords"
                    content="D' Hages Turismo, viagens, pacotes de viagens, Belém, Pará, destinos turísticos, agência de viagens, excursões, aventura, turismo, agência turismo Belém, agencia turismo belem, agencia de viagens belem, agencia de viagens em belem, agencia de turismo em belem, pacotes de viagens belem, pacotes de viagens em belem, destinos turísticos belem, destinos turísticos em belem"
                />
                <link rel="canonical" href="https://seusite.com/" />
                <meta name="robots" content="index, follow" />
                <meta property="og:locale" content="pt_BR" />
                <meta property="og:site_name" content="D' Hages Turismo" />
                <meta property="og:title" content="D' Hages Turismo | Agência de Viagens em Belém - Pacotes e Destinos" />
                <meta
                    property="og:description"
                    content="Descubra os melhores pacotes de viagens e destinos com a D' Hages Turismo em Belém. Aventuras memoráveis, atendimento personalizado e as melhores ofertas para sua próxima viagem."
                />
                <meta property="og:url" content="https://seusite.com/" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={defaultOgImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content={defaultOgImageAlt} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="D' Hages Turismo | Agência de Viagens em Belém - Pacotes e Destinos" />
                <meta
                    property="twitter:description"
                    content="Descubra os melhores pacotes de viagens e destinos com a D' Hages Turismo em Belém. Aventuras memoráveis, atendimento personalizado e as melhores ofertas para sua próxima viagem."
                />
                <meta name="twitter:image" content={defaultOgImage} />
                <meta name="twitter:image:alt" content={defaultOgImageAlt} />
                <script type="application/ld+json">
                    {`
                    {
                      "@context": "https://schema.org",
                      "@type": "TravelAgency",
                      "name": "D' Hages Turismo",
                      "url": "https://seusite.com/",
                      "logo": "https://seusite.com/images/logo-dhages.png",
                      "description": "Sua agência de viagens em Belém, Pará. Especializada em pacotes turísticos e destinos memoráveis.",
                      "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Av. Senador Lemos, 3153, lojas 30/31 - 1º piso, It Center - Sacramenta",
                        "addressLocality": "Belém",
                        "addressRegion": "PA",
                        "postalCode": "66120-000",
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
                    {/* Renderiza um componente GalleryPhotos para cada galeria */}
                    {galleries?.map((gallery) => (
                        <GalleryPhotos key={gallery.id} gallery={gallery} />
                    ))}
                    <Header />
                    <PromotionsForm />
                    <Testimonials testimonials={testimonials} />
                    <FAQ faqs={faqs} />
                    <Footer menuData={menu} />
                </main>
                <WhatsAppButton />
            </div>

            {/* {showExitModal && ( ... )} */}
        </>
    );
}