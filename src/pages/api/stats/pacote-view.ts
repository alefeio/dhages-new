// src/pages/api/stats/pacote-view.ts

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
        const updatedPacote = await prisma.pacote.update({
            where: { id: pacoteId },
            data: { view: { increment: 1 } },
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