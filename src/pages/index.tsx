// pages/index.tsx
import { PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Script from 'next/script';
import HeroSlider from '../components/HeroSlider';
import WhatsAppButton from '../components/WhatsAppButton';
import PacotesGallery from '../components/PacotesGallery'; // <-- ajustado
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
                orderBy: { title: 'asc' },
                include: { pacotes: { include: { fotos: true, dates: true } } },
            }),
        ]);

        // Gera slugs para destinos e pacotes
        const destinosComSlugs: Destino[] = destinos.map((destino: any) => ({
            ...destino,
            slug: slugify(destino.title),
            pacotes: destino.pacotes.map((pacote: any) => ({
                ...pacote,
                slug: slugify(pacote.title),
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

    return (
        <>
            <Head>
                <title>My Dress Belém | Aluguel de Pacotes e Destinos</title>
                <meta name="description" content="Descubra os melhores destinos e pacotes de viagem. Atendimento personalizado via WhatsApp." />
                {/* ... outras meta tags ... */}
            </Head>

            <div className="min-h-screen">
                <Analytics />
                <MenuComponent menuData={menu} />
                <HeroSlider banners={banners} />
                <main className="max-w-full mx-auto">
                    <Hero />
                    <PacotesGallery destinos={destinos} /> {/* <-- ajuste aqui */}
                    <Header />
                    <PromotionsForm />
                    <Testimonials testimonials={testimonials} />
                    <FAQ faqs={faqs} />
                    <LocationMap />
                </main>
                <WhatsAppButton />
            </div>

            {showExitModal && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowExitModal(false); }}
                >
                    <div
                        className="bg-background-200 relative rounded-lg shadow-xl p-6 m-4 max-w-lg w-full transform transition-all duration-300 scale-100"
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
            )}
        </>
    );
}
