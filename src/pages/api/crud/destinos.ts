// pages/api/destinos.ts
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Destino, Pacote, PacoteFoto, PacoteDate } from 'types';

const prisma = new PrismaClient();

// Função utilitária para criar slugs
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/-+$/, '');
}

// Tipos auxiliares com relações
type PacoteWithRelations = Pacote & {
  fotos: PacoteFoto[];
  dates: PacoteDate[];
};

type DestinoWithRelations = Destino & {
  pacotes: PacoteWithRelations[];
};

// Função para adicionar slugs a destinos e pacotes
function addSlugs(destinos: (Destino & { pacotes: PacoteWithRelations[] })[]): DestinoWithRelations[] {
  return destinos.map(destino => ({
    ...destino,
    slug: slugify(destino.title),
    pacotes: destino.pacotes.map(pacote => ({
      ...pacote,
      slug: slugify(pacote.title),
    })),
  }));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;

    switch (method) {
      case 'GET': {
        try {
          const destinosRaw = await prisma.destino.findMany({
            include: {
              pacotes: {
                include: {
                  fotos: true,
                  dates: { orderBy: { saida: 'asc' } },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          });

          const destinosComSlugs = destinosRaw.map((d: Destino & { pacotes: Pacote[] }) => ({
            ...d,
            slug: d.slug || slugify(d.title),
            pacotes: d.pacotes.map((p: Pacote) => ({
              ...p,
              slug: p.slug || slugify(p.title),
            })),
          }));

          return res.status(200).json({ success: true, destinos: destinosComSlugs });
        } catch (error) {
          console.error('Erro ao buscar destinos:', error);
          return res.status(500).json({ success: false, message: 'Erro ao buscar destinos.' });
        }
      }

      case 'POST': {
        try {
          const { title, subtitle, description, image, pacotes } = req.body as Destino & { pacotes?: Pacote[] };

          const createdDestino = await prisma.destino.create({
            data: {
              title,
              slug: slugify(title),
              subtitle,
              description,
              image,
              pacotes: {
                create: (pacotes || []).map(p => ({
                  title: p.title,
                  slug: slugify(p.title),
                  subtitle: p.subtitle,
                  description: p.description,
                  fotos: { create: p.fotos || [] },
                  dates: { create: p.dates || [] },
                })),
              },
            },
            include: { pacotes: { include: { fotos: true, dates: true } } },
          });

          const destinoComSlug = addSlugs([createdDestino])[0];

          return res.status(201).json({ success: true, data: destinoComSlug });
        } catch (error) {
          console.error('Erro ao criar destino:', error);
          return res.status(500).json({ success: false, message: 'Erro ao criar destino.' });
        }
      }

      case 'PUT': {
        try {
          const { id, pacotes, ...rest } = req.body as Destino & { id: string; pacotes?: Pacote[] };

          if (!id) return res.status(400).json({ success: false, message: 'ID do destino é obrigatório.' });

          // Atualiza dados do destino
          await prisma.destino.update({ where: { id }, data: rest });

          // Atualiza ou cria pacotes
          if (pacotes && Array.isArray(pacotes)) {
            const txOps = pacotes.map(p => {
              if (p.id) {
                return prisma.pacote.update({
                  where: { id: p.id },
                  data: {
                    title: p.title,
                    subtitle: p.subtitle,
                    slug: slugify(p.title),
                    description: p.description,
                  },
                });
              } else {
                return prisma.pacote.create({
                  data: {
                    title: p.title,
                    subtitle: p.subtitle,
                    slug: slugify(p.title),
                    description: p.description,
                    destinoId: id,
                    fotos: { create: (p.fotos || []).map(f => ({ url: f.url, caption: f.caption })) },
                    dates: {
                      create: (p.dates || []).map(d => ({
                        saida: new Date(d.saida),
                        retorno: new Date(d.retorno),
                        vagas_total: d.vagas_total,
                        vagas_disponiveis: d.vagas_disponiveis,
                        price: d.price,
                        price_card: d.price_card,
                        status: d.status,
                        notes: d.notes,
                      }))
                    },
                  },
                });
              }
            });
            await prisma.$transaction(txOps);
          }

          const updatedDestino = await prisma.destino.findUnique({
            where: { id },
            include: { pacotes: { include: { fotos: true, dates: true } } },
          });

          if (!updatedDestino) return res.status(404).json({ success: false, message: 'Destino não encontrado.' });

          const destinoComSlug = addSlugs([updatedDestino])[0];

          return res.status(200).json({ success: true, data: destinoComSlug });
        } catch (error) {
          console.error('Erro ao atualizar destino:', error);
          return res.status(500).json({ success: false, message: 'Erro ao atualizar destino.' });
        }
      }

      case 'DELETE': {
        try {
          const { id } = req.query;
          if (!id || typeof id !== 'string') return res.status(400).json({ success: false, message: 'ID do destino é obrigatório.' });

          await prisma.destino.delete({ where: { id } });
          return res.status(200).json({ success: true, message: 'Destino excluído com sucesso.' });
        } catch (error) {
          console.error('Erro ao excluir destino:', error);
          return res.status(500).json({ success: false, message: 'Erro ao excluir destino.' });
        }
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Método ${method} não permitido`);
    }
  } finally {
    await prisma.$disconnect();
  }
}
