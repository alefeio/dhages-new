// src/pages/destinos/[destinoSlug].tsx
import { GetServerSideProps } from 'next';
import Home from '../../index';
import { Banner, MenuItem, TestimonialItem, FaqItem, Destino, Pacote, PacoteFoto, PacoteDate } from 'types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const [bannersRaw, menusRaw, testimonialsRaw, faqsRaw, destinosRaw] =
      await Promise.all([
        prisma.banner.findMany(),
        prisma.menu.findMany(),
        prisma.testimonial.findMany(),
        prisma.fAQ.findMany({ orderBy: { pergunta: 'asc' } }),
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

    // Pega apenas o primeiro menu
    const menu = menusRaw.length > 0 ? menusRaw[0] : null;

    // Acrescenta slug nos destinos e pacotes
    const destinos: Destino[] = destinosRaw.map(d => ({
      ...d,
      slug: d.slug || slugify(d.title),
      pacotes: d.pacotes.map(p => ({
        ...p,
        slug: p.slug || slugify(p.title),
        fotos: p.fotos.map(f => ({
          ...f,
          caption: f.caption ?? undefined,
        })) as PacoteFoto[],
        dates: p.dates.map(d => ({
          ...d,
          notes: d.notes ?? undefined,
        })) as PacoteDate[],
      })) as Pacote[],
    }));


    return {
      props: {
        banners: JSON.parse(JSON.stringify(bannersRaw)) as Banner[],
        menu: JSON.parse(JSON.stringify(menu)) as MenuItem | null,
        testimonials: JSON.parse(JSON.stringify(testimonialsRaw)) as TestimonialItem[],
        faqs: JSON.parse(JSON.stringify(faqsRaw)) as FaqItem[],
        destinos: JSON.parse(JSON.stringify(destinos)) as Destino[],
      },
    };
  } catch (error) {
    console.error('Erro ao buscar dados do banco de dados:', error);
    return {
      props: {
        banners: [],
        menu: null,
        testimonials: [],
        faqs: [],
        destinos: [],
      },
    };
  }
};

interface DestinoPageProps {
  banners: Banner[];
  menu: MenuItem | null;
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
  destinos: Destino[];
}

export default function DestinoPage(props: DestinoPageProps) {
  return <Home {...props} />;
}
