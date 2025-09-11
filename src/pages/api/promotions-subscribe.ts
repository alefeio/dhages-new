// src/pages/api/promotions-subscribe.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    const { name, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Nome e email são obrigatórios.' });
    }

    try {
        // Verifica se o email já está na tabela de marketing para evitar duplicatas
        const existingSubscriber = await prisma.subscriber.findUnique({
            where: { email },
        });

        if (existingSubscriber) {
            return res.status(409).json({ message: 'Este email já está cadastrado para promoções.' });
        }

        // Transação para garantir que os dados sejam salvos em ambas as tabelas ou em nenhuma
        await prisma.$transaction([
            // Salva os dados na tabela de marketing
            prisma.subscriber.create({
                data: {
                    name,
                    email,
                    phone,
                },
            }),
            // Salva um registro básico na tabela de usuários para futuro login
            prisma.user.upsert({
                where: { email },
                update: {}, // Não faz nada se o usuário já existir
                create: {
                    name,
                    email,
                    role: 'USER', // Role padrão, pode ser alterada manualmente
                },
            }),
        ]);

        // Envia o email de boas-vindas
        await resend.emails.send({
            from: "D' Hages Turismo <contato@dhagesturismo.com.br>", // Altere para o seu email verificado da D' Hages
            to: email,
            subject: `Fique por dentro das nossas promoções, ${name}! | D' Hages Turismo`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Bem-vindo(a) à D' Hages Turismo, ${name}!</title>
                    <style>
                        body { font-family: sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
                        .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
                        .header img { max-width: 180px; } /* Ajuste o tamanho do logo se necessário */
                        .content p { margin-bottom: 15px; }
                        .cta-button { display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #FF5722; /* Cor mais relacionada a viagens, laranja */ text-decoration: none; border-radius: 5px; }
                        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="https://seusite.com/images/logo-dhages.png" alt="Logo D' Hages Turismo" /> </div>
                        <div class="content">
                            <p>Olá, ${name}!</p>
                            <p>Seja bem-vindo(a) à família D' Hages Turismo! Estamos muito felizes em ter você conosco.</p>
                            <p>A partir de agora, você fará parte da nossa lista exclusiva e receberá em primeira mão as melhores ofertas de pacotes de viagens, destinos imperdíveis, promoções especiais e todas as novidades que preparamos para você.</p>
                            <p>Prepare-se para embarcar em novas aventuras e criar memórias inesquecíveis. Estamos ansiosos para te levar aos seus sonhos!</p>
                            <p>Atenciosamente,</p>
                            <p>A equipe D' Hages Turismo.</p>
                            <p><a href="https://seusite.com/pacotes" class="cta-button">Ver Nossos Pacotes de Viagem</a></p> </div>
                        <div class="footer">
                            <p>D' Hages Turismo - Sua agência de viagens em Belém, Pará.</p>
                            <p>&copy; ${new Date().getFullYear()} D' Hages Turismo. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        return res.status(200).json({ success: true, message: 'Cadastro realizado com sucesso! Em breve você receberá nossas promoções.' });
    } catch (error) {
        console.error('Erro ao cadastrar para promoções:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}