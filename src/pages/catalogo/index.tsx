// src/pages/catalogo/index.tsx

import { PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Script from 'next/script';
import WhatsAppButton from '../../components/WhatsAppButton';
import { Analytics } from "@vercel/analytics/next";
import { Destino, Pacote, PacoteDate, PacoteMidia } from '../../types'; // Importe PacoteMidia
import Catalog from '../../components/Catalog';

const prisma = new PrismaClient();

interface CatalogPageProps {
    destinos: Destino[];
}

// Função para gerar slug
function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export const getServerSideProps: GetServerSideProps<CatalogPageProps> = async () => {
    try {
        const destinosRaw = await prisma.destino.findMany({
            orderBy: { title: 'asc' },
            include: {
                pacotes: {
                    orderBy: [
                        { like: 'desc' },
                        { view: 'desc' },
                    ],
                    include: {
                        fotos: true,
                        dates: true,
                    },
                },
            },
        });

        const destinos: Destino[] = destinosRaw.map(destino => ({
            ...destino,
            slug: slugify(`${destino.title}-${destino.id}`),
            pacotes: destino.pacotes.map(pacote => ({
                ...pacote,
                slug: slugify(`${pacote.title}-${pacote.subtitle || ''}-${pacote.id}`),
                // AQUI ESTÁ A MUDANÇA: 'type: "image"' em vez de 'type: "foto"'
                fotos: (pacote.fotos || []).map(foto => ({
                    ...foto,
                    type: 'image', // <--- Mudei 'foto' para 'image'
                })) as PacoteMidia[],
                dates: pacote.dates.map(d => ({
                    ...d,
                    status:
                        d.status === "disponivel" || d.status === "esgotado" || d.status === "cancelado"
                            ? d.status
                            : "disponivel",
                })) as PacoteDate[],
            })),
        }));

        return {
            props: {
                destinos: JSON.parse(JSON.stringify(destinos)),
            },
        };
    } catch (error) {
        console.error('Erro ao buscar destinos do banco de dados:', error);
        return {
            props: {
                destinos: [],
            },
        };
    } finally {
        await prisma.$disconnect();
    }
};

export default function Catalogo({ destinos }: CatalogPageProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Dhages Turismo",
        "image": "https://www.dhagesturismo.com.br/images/logo.png",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Exemplo, 123",
            "addressLocality": "Belém",
            "addressRegion": "PA",
            "postalCode": "66000-000",
            "addressCountry": "BR"
        }
    };

    return (
        <>
            <Head>
                <title>Dhages Turismo | Pacotes e Destinos Incríveis</title>
                <meta name="description" content="Descubra nossos pacotes de viagem exclusivos. Reserve já seu destino com a Dhages Turismo." />
                <meta name="keywords" content="pacotes de viagem Belém, turismo Belém, Dhages Turismo, viagens personalizadas" />
                <Script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </Head>

            <div className="min-h-screen">
                <Analytics />
                <main className="max-w-full mx-auto">
                    <Catalog destinos={destinos} />
                </main>
                <WhatsAppButton />
            </div>
        </>
    );
}