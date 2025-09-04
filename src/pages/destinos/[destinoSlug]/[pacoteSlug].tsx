// pages/destinos/[destinoSlug]/[pacoteSlug].tsx
import { GetServerSideProps } from 'next';
import Home from '../../index';
import { PrismaClient } from '@prisma/client';
import { Destino } from '../../../types';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const prisma = new PrismaClient();
  try {
    const [banners, menus, testimonials, faqs, destinos] = await Promise.all([
      prisma.banner.findMany(),
      prisma.menu.findMany(),
      prisma.testimonial.findMany(),
      prisma.fAQ.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.destino.findMany({
        include: {
          pacotes: {
            include: {
              fotos: true,
              dates: true,
            },
          },
        },
      }),
    ]);

    const menu = menus.length > 0 ? menus[0] : null;

    return {
      props: {
        banners: JSON.parse(JSON.stringify(banners)),
        menu: JSON.parse(JSON.stringify(menu)),
        testimonials: JSON.parse(JSON.stringify(testimonials)),
        faqs: JSON.parse(JSON.stringify(faqs)),
        destinos: JSON.parse(JSON.stringify(destinos)),
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

interface PacotePageProps {
  banners: any[];
  menu: any | null;
  testimonials: any[];
  faqs: any[];
  destinos: Destino[];
}

export default function PacotePage(props: PacotePageProps) {
  // Apenas renderiza o componente Home com todas as props
  return <Home {...props} />;
}
