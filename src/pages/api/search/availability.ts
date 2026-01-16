// pages/api/search/availability.ts
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const hoje = new Date();

    // Buscamos destinos que tenham pelo menos um pacote com data futura
    const resultados = await prisma.destino.findMany({
      where: {
        pacotes: {
          some: {
            dates: {
              some: {
                saida: { gte: hoje }
              }
            }
          }
        }
      },
      include: {
        pacotes: {
          include: {
            fotos: { take: 1 }, // Apenas a foto principal para economizar banda
            dates: {
              where: { saida: { gte: hoje } },
              orderBy: { saida: 'asc' }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    return res.status(200).json({ success: true, data: resultados });
  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({ success: false, message: 'Erro ao buscar disponibilidades.' });
  } finally {
    await prisma.$disconnect();
  }
}