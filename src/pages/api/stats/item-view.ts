// src/pages/api/stats/item-view.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  const { pacoteId } = req.body;

  if (!pacoteId) {
    return res.status(400).json({ message: 'ID do pacote é obrigatório.' });
  }

  try {
    // Buscar pacote atual
    const pacote = await prisma.pacote.findUnique({
      where: { id: pacoteId },
      select: { view: true },
    });

    if (!pacote) {
      return res.status(404).json({ message: 'Pacote não encontrado.' });
    }

    // Incrementar view
    const updatedPacote = await prisma.pacote.update({
      where: { id: pacoteId },
      data: { view: (pacote.view ?? 0) + 1 },
      select: { id: true, view: true },
    });

    res.status(200).json({ success: true, pacote: updatedPacote });
  } catch (error) {
    console.error('Erro ao registrar visualização:', error);
    res.status(500).json({ message: 'Erro ao processar a requisição.' });
  } finally {
    await prisma.$disconnect();
  }
}
