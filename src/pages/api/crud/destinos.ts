// pages/api/destinos.ts
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Destino, PacoteFoto, PacoteDate } from 'types';

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
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Função para adicionar slugs e converter campos
function addSlugs(destinos: any[]): Destino[] {
  return destinos.map((d) => ({
    ...d,
    slug: d.slug || slugify(d.title),
    pacotes: d.pacotes.map((p: any) => ({
      ...p,
      slug: p.slug || slugify(p.title),
      fotos: p.fotos.map((f: any): PacoteFoto => ({
        ...f,
        caption: f.caption ?? undefined,
      })),
      dates: p.dates.map((dt: any): PacoteDate => ({
        ...dt,
        saida: dt.saida instanceof Date ? dt.saida.toISOString() : dt.saida,
        retorno: dt.retorno instanceof Date ? dt.retorno.toISOString() : dt.retorno,
        notes: dt.notes ?? undefined,
      })),
    })),
  }));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;

    switch (method) {
      case 'GET': {
        const destinosRaw = await prisma.destino.findMany({
          include: { pacotes: { include: { fotos: true, dates: { orderBy: { saida: 'asc' } } } } },
          orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json({ success: true, destinos: addSlugs(destinosRaw) });
      }

      case 'POST': {
        const { title, subtitle, description, image, pacotes } = req.body as Destino & { pacotes?: any[] };

        const createdDestino = await prisma.destino.create({
          data: {
            title,
            slug: slugify(title),
            subtitle,
            description,
            image,
            pacotes: {
              create: (pacotes || []).map((p) => ({
                title: p.title,
                slug: slugify(p.title),
                subtitle: p.subtitle,
                description: p.description,
                fotos: { create: p.fotos?.map(f => ({ url: f.url, caption: f.caption ?? undefined })) || [] },
                dates: { create: p.dates?.map(d => ({ ...d, saida: new Date(d.saida), retorno: new Date(d.retorno) })) || [] },
              })),
            },
          },
          include: { pacotes: { include: { fotos: true, dates: true } } },
        });

        return res.status(201).json({ success: true, data: addSlugs([createdDestino])[0] });
      }

      case 'PUT': {
        const { id, pacotes, ...rest } = req.body as Destino & { id: string; pacotes?: any[] };
        if (!id) return res.status(400).json({ success: false, message: 'ID do destino é obrigatório.' });

        await prisma.destino.update({ where: { id }, data: rest });

        if (pacotes?.length) {
          const txOps = pacotes.map((p) => p.id
            ? prisma.pacote.update({
                where: { id: p.id },
                data: { title: p.title, subtitle: p.subtitle, slug: slugify(p.title), description: p.description },
              })
            : prisma.pacote.create({
                data: {
                  title: p.title,
                  subtitle: p.subtitle,
                  slug: slugify(p.title),
                  description: p.description,
                  destinoId: id,
                  fotos: { create: p.fotos?.map(f => ({ url: f.url, caption: f.caption ?? undefined })) || [] },
                  dates: { create: p.dates?.map(d => ({ ...d, saida: new Date(d.saida), retorno: new Date(d.retorno) })) || [] },
                },
              })
          );
          await prisma.$transaction(txOps);
        }

        const updatedDestino = await prisma.destino.findUnique({
          where: { id },
          include: { pacotes: { include: { fotos: true, dates: true } } },
        });

        if (!updatedDestino) return res.status(404).json({ success: false, message: 'Destino não encontrado.' });

        return res.status(200).json({ success: true, data: addSlugs([updatedDestino])[0] });
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id || typeof id !== 'string') return res.status(400).json({ success: false, message: 'ID do destino é obrigatório.' });

        await prisma.destino.delete({ where: { id } });
        return res.status(200).json({ success: true, message: 'Destino excluído com sucesso.' });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Método ${method} não permitido`);
    }
  } finally {
    await prisma.$disconnect();
  }
}
