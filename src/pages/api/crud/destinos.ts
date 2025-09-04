// pages/api/crud/destinos.ts
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Destino } from 'types'; // Certifique-se de que a tipagem está correta

const prisma = new PrismaClient();

// Função utilitária para criar slugs únicos
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;

    switch (method) {
      case 'GET': {
        const destinos = await prisma.destino.findMany({
          include: { pacotes: { include: { fotos: true, dates: { orderBy: { saida: 'asc' } } } } },
          orderBy: { order: 'asc' }, // Ordena por `order` para o frontend
        });
        return res.status(200).json({ success: true, destinos });
      }

      case 'POST': {
        const { title, subtitle, description, image, order, pacotes } = req.body;
        if (!title || !description) {
          return res.status(400).json({ success: false, message: 'Título e descrição são obrigatórios.' });
        }

        const newDestino = await prisma.destino.create({
          data: {
            title,
            slug: slugify(`${title}-${Date.now()}`),
            subtitle: subtitle || null,
            description,
            image: image || null,
            order: order || 0,
            pacotes: {
              create: (pacotes || []).map((p: any) => ({
                title: p.title,
                slug: slugify(`${p.title}-${Date.now()}`),
                subtitle: p.subtitle || null,
                description: p.description,
                fotos: { create: p.fotos.map((f: any) => ({ url: f.url, caption: f.caption || null })) },
                dates: {
                  create: p.dates.map((d: any) => ({
                    saida: new Date(d.saida),
                    retorno: new Date(d.retorno),
                    vagas_total: d.vagas_total,
                    vagas_disponiveis: d.vagas_disponiveis,
                    price: d.price,
                    price_card: d.price_card,
                    status: d.status,
                    notes: d.notes || null,
                  })),
                },
              })),
            },
          },
          include: { pacotes: { include: { fotos: true, dates: true } } },
        });

        return res.status(201).json({ success: true, data: newDestino });
      }

      case 'PUT': {
        const { id, title, subtitle, description, image, order, pacotes } = req.body;
        if (!id) {
          return res.status(400).json({ success: false, message: 'ID do destino é obrigatório para a atualização.' });
        }

        // 1. Encontrar todos os pacotes existentes para este destino
        const existingPacotes = await prisma.pacote.findMany({ where: { destinoId: id } });
        const existingPacoteIds = new Set(existingPacotes.map(p => p.id));
        const incomingPacoteIds = new Set((pacotes || []).filter((p: any) => p.id).map((p: any) => p.id));

        const txOps = [];

        // 2. Atualizar ou criar pacotes aninhados e seus subitens
        for (const p of (pacotes || [])) {
          if (p.id) {
            // Se o pacote tem um ID, é uma atualização
            txOps.push(
              prisma.pacote.update({
                where: { id: p.id },
                data: {
                  title: p.title,
                  subtitle: p.subtitle || null,
                  slug: slugify(`${p.title}-${p.id}`), // Garante slug atualizado
                  description: p.description,
                  fotos: {
                    // Sincroniza fotos: delete as antigas, crie as novas
                    deleteMany: { pacoteId: p.id },
                    create: p.fotos.map((f: any) => ({ url: f.url, caption: f.caption || null })),
                  },
                  dates: {
                    // Sincroniza datas: delete as antigas, crie as novas
                    deleteMany: { pacoteId: p.id },
                    create: p.dates.map((d: any) => ({
                      saida: new Date(d.saida),
                      retorno: new Date(d.retorno),
                      vagas_total: d.vagas_total,
                      vagas_disponiveis: d.vagas_disponiveis,
                      price: d.price,
                      price_card: d.price_card,
                      status: d.status,
                      notes: d.notes || null,
                    })),
                  },
                },
              })
            );
          } else {
            // Se o pacote não tem ID, é uma criação
            txOps.push(
              prisma.pacote.create({
                data: {
                  title: p.title,
                  subtitle: p.subtitle || null,
                  slug: slugify(`${p.title}-${Date.now()}`),
                  description: p.description,
                  destinoId: id,
                  fotos: { create: p.fotos.map((f: any) => ({ url: f.url, caption: f.caption || null })) },
                  dates: {
                    create: p.dates.map((d: any) => ({
                      saida: new Date(d.saida),
                      retorno: new Date(d.retorno),
                      vagas_total: d.vagas_total,
                      vagas_disponiveis: d.vagas_disponiveis,
                      price: d.price,
                      price_card: d.price_card,
                      status: d.status,
                      notes: d.notes || null,
                    })),
                  },
                },
              })
            );
          }
        }

        // 3. Remover pacotes que não estão mais no payload de entrada
        const idsToDelete = [...existingPacoteIds].filter(id => !incomingPacoteIds.has(id));
        if (idsToDelete.length > 0) {
          txOps.push(prisma.pacote.deleteMany({ where: { id: { in: idsToDelete } } }));
        }

        // 4. Atualizar o Destino principal
        txOps.push(
          prisma.destino.update({
            where: { id },
            data: {
              title,
              subtitle: subtitle || null,
              description,
              image: image || null,
              order,
              slug: slugify(title) // Atualiza o slug do destino
            },
          })
        );

        // Executar todas as operações de banco de dados em uma transação
        await prisma.$transaction(txOps);

        const updatedDestino = await prisma.destino.findUnique({
          where: { id },
          include: { pacotes: { include: { fotos: true, dates: true } } },
        });

        if (!updatedDestino) {
          return res.status(404).json({ success: false, message: 'Destino não encontrado.' });
        }

        return res.status(200).json({ success: true, data: updatedDestino });
      }

      case 'DELETE': {
        const { id } = req.body;
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ success: false, message: 'ID do destino é obrigatório.' });
        }
        await prisma.destino.delete({ where: { id } });
        return res.status(200).json({ success: true, message: 'Destino excluído com sucesso.' });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Método ${method} não permitido`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.', error: (error as Error).message });
  } finally {
    await prisma.$disconnect();
  }
}