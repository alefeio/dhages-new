import { PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Script from 'next/script';
import WhatsAppButton from '../../components/WhatsAppButton';
import { Analytics } from "@vercel/analytics/next";
import {
    HomePageProps,
    ColecaoProps} from '../../types/index';
import Catalog from 'components/Catalog';

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
        const [banners, menus, testimonials, faqs, colecoes] = await Promise.all([
            prisma.banner.findMany(),
            prisma.menu.findMany(),
            prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.fAQ.findMany({ orderBy: { pergunta: 'asc' } }),
            prisma.colecao.findMany({
                orderBy: {
                    order: 'asc', // Ordena as coleções pela ordem definida
                },
                include: {
                    items: {
                        // CORRIGIDO: Adiciona a ordenação dos itens por likes e views.
                        orderBy: [
                            { like: 'desc' },
                            { view: 'desc' },
                        ],
                    },
                },
            }),
        ]);

        const colecoesComSlugs: ColecaoProps[] = colecoes.map((colecao: any) => ({
            ...colecao,
            slug: slugify(colecao.title),
            items: colecao.items.map((item: any) => ({
                ...item,
                slug: slugify(`${item.productMark}-${item.productModel}-${item.cor}`),
            }))
        }));

        const menu: any | null = menus.length > 0 ? menus[0] : null;

        return {
            props: {
                banners: JSON.parse(JSON.stringify(banners)),
                menu: JSON.parse(JSON.stringify(menu)),
                testimonials: JSON.parse(JSON.stringify(testimonials)),
                faqs: JSON.parse(JSON.stringify(faqs)),
                colecoes: JSON.parse(JSON.stringify(colecoesComSlugs)),
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
                colecoes: [],
            },
        };
    } finally {
        await prisma.$disconnect();
    }
};

export default function Catalogo({ banners, menu, testimonials, faqs, colecoes }: HomePageProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "My Dress - Aluguel de Vestidos",
        "image": "https://www.mydressbelem.com.br/images/logo.png",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Passagem Tapajós 6, Tv. da Estrela, 46, Marco",
            "addressLocality": "Belém",
            "addressRegion": "PA",
            "postalCode": "66093-065",
            "addressCountry": "BR"
        }
    };

    return (
        <>
            <Head>
                {/* Google Analytics (via GTM) - Código para a tag <head> */}
                <Script
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W4S948NS');`
                    }}
                />
                <title>My Dress Belém | Aluguel de Vestidos de Festa para Madrinhas, Formandas e Convidadas | O melhor custo-benefício</title>
                <meta name="description" content="Aluguel de vestidos de festa em Belém‑PA: madrinhas, formandas, convidadas. Atendimento por agendamento, atendimento personalizado, catálogo atualizado, agende via WhatsApp 91 98581-0208." />
                <meta name="keywords" content="aluguel vestidos festa Belém, aluguel vestidos madrinhas Belém, vestidos formatura Belém, aluguel vestidos convidadas Belém, My Dress Belém, aluguel de trajes finos em belém, aluguel de vestidos de festa belem, aluguel de vestidos de gala belem, aluguel de vestidos de festa para madrinhas belem, aluguel de vestidos de festa para formandas belem, aluguel de vestidos de festa para convidadas belem, loja de aluguel de vestido belem, mydress, vestidos de debutantes, vestidos de festa, aluguel de roupas pedreira, aluguel de roupas marco, aluguel de roupas são brás, aluguel de roupas são braz, aluguel de roupas nazaré, aluguel de roupas umarizal, aluguel de roupas, aluguel roupa festa, aluguel vestidos festa luxo, vestido para alugar" />
                <meta property="og:title" content="My Dress Belém | Aluguel de Vestidos de Festa" />
                <meta property="og:description" content="Aluguel de vestidos elegantes para madrinhas, formandas e convidadas em Belém‑PA. Atendimento exclusivo por agendamento via WhatsApp." />
                <meta property="og:image" content="https://www.mydressbelem.com.br/images/banner/banner1.jpg" />
                <meta property="og:url" content="https://www.mydressbelem.com.br" />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="My Dress Belém | Aluguel de Vestidos de Festa" />
                <meta name="twitter:description" content="Aluguel de vestidos elegantes em Belém‑PA. Atendimento por agendamento via WhatsApp." />
                <meta name="twitter:image" content="https://www.mydressbelem.com.br/images/banner/banner1.jpg" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet" />
                <Script id="google-ads-init" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'AW-17411208522');
                    `}
                </Script>

                {/* Facebook Pixel */}
                <Script id="facebook-pixel" strategy="afterInteractive">
                    {`
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){
                        n.callMethod ?
                        n.callMethod.apply(n,arguments) : n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;
                        n.push=n; n.loaded=!0; n.version='2.0';
                        n.queue=[]; t=b.createElement(e); t.async=!0;
                        t.src=v; s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}
                        (window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '754061187167582');
                        fbq('track', 'PageView');
                    `}
                </Script>
            </Head>

            {/* Google Analytics (via GTM) - Código para logo após a tag <body> */}
            <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W4S948NS"
                height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe></noscript>

            {/* JSON-LD */}
            <Script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Google Ads */}
            <Script
                src="https://www.googletagmanager.com/gtag/js?id=AW-17411208522"
                strategy="afterInteractive"
            />

            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: 'none' }}
                    src="https://www.facebook.com/tr?id=754061187167582&ev=PageView&noscript=1"
                    alt="Facebook Pixel"
                />
            </noscript>

            <div className="min-h-screen">
                <Analytics />
                <main className="max-w-full mx-auto">
                    <Catalog colecoes={colecoes} />
                </main>
                <WhatsAppButton />
            </div>
        </>
    );
}