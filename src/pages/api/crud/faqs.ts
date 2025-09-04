import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Lógica para criar uma nova FAQ
    const { pergunta, resposta } = req.body;
    if (!pergunta || !resposta) {
      return res.status(400).json({ message: 'A pergunta e a resposta são obrigatórias.' });
    }
    try {
      await prisma.fAQ.create({
        data: {
          pergunta,
          resposta,
        },
      });
      const faqs = await prisma.fAQ.findMany({ orderBy: { pergunta: 'asc' } });
      return res.status(200).json(faqs);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao criar a FAQ.' });
    }
  } else if (req.method === 'PUT') {
    // Lógica para atualizar uma FAQ existente
    const { id, pergunta, resposta } = req.body;
    if (!id || !pergunta || !resposta) {
      return res.status(400).json({ message: 'ID, pergunta e resposta são obrigatórios.' });
    }
    try {
      await prisma.fAQ.update({
        where: { id },
        data: {
          pergunta,
          resposta,
        },
      });
      const faqs = await prisma.fAQ.findMany({ orderBy: { pergunta: 'asc' } });
      return res.status(200).json(faqs);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao atualizar a FAQ.' });
    }
  } else if (req.method === 'DELETE') {
    // Lógica para deletar uma FAQ
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'O ID é obrigatório para a exclusão.' });
    }
    try {
      await prisma.fAQ.delete({
        where: { id },
      });
      const faqs = await prisma.fAQ.findMany({ orderBy: { pergunta: 'asc' } });
      return res.status(200).json(faqs);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao excluir a FAQ.' });
    }
  } else {
    // Método não permitido
    res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}