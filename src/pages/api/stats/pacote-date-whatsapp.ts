import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    const { pacoteId, dateSaida } = req.body;

    if (!pacoteId || !dateSaida) {
        return res.status(400).json({ message: 'ID do pacote e data de saída são necessários.' });
    }

    const prisma = new PrismaClient();

    try {
        const updatedPacoteDate = await prisma.pacoteDate.update({
            where: {
                pacoteId_saida: {
                    pacoteId: pacoteId,
                    saida: new Date(dateSaida),
                },
            },
            data: {
                whatsapp: {
                    increment: 1,
                },
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Clique de Mais Informações registrado com sucesso.',
            data: updatedPacoteDate,
        });

    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2025') {
                return res.status(404).json({ message: 'Pacote ou data de saída não encontrados.' });
            }
        }
        console.error('Erro na API de mais informações:', e);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        await prisma.$disconnect();
    }
}