// pages/api/crud/pacotes.ts
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;

    if (method !== 'DELETE') {
      res.setHeader('Allow', ['DELETE']);
      return res.status(405).end(`Método ${method} não permitido`);
    }

    const { id } = req.body;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'ID do pacote é obrigatório.' });
    }

    const pacote = await prisma.pacote.findUnique({ where: { id } });
    if (!pacote) {
      return res.status(404).json({ success: false, message: 'Pacote não encontrado.' });
    }

    await prisma.pacote.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Pacote excluído com sucesso.' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.', error: (error as Error).message });
  } finally {
    await prisma.$disconnect();
  }
}