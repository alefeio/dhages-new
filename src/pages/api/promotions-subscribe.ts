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
            from: "My Dress Belém <contato@mydressbelem.com.br>", // Altere para o seu email verificado
            to: email,
            subject: `Fique por dentro das nossas promoções, ${name}!`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Bem-vinda, ${name}!</title>
                    <style>
                        body { font-family: sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
                        .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
                        .header img { max-width: 150px; }
                        .content p { margin-bottom: 15px; }
                        .cta-button { display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #A9876D; text-decoration: none; border-radius: 5px; }
                        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="https://mydressbelem.com.br/images/logo.png" alt="Logo My Dress" />
                        </div>
                        <div class="content">
                            <p>Olá, ${name}!</p>
                            <p>Seja bem-vinda à nossa lista exclusiva de promoções! A partir de agora, você será a primeira a saber sobre os nossos descontos, coleções especiais e novidades imperdíveis.</p>
                            <p>Prepare-se para encontrar o vestido perfeito para a sua próxima ocasião especial!</p>
                            <p>Atenciosamente,</p>
                            <p>A equipe My Dress Belém.</p>
                            <p><a href="https://mydressbelem.com.br/catalogo" class="cta-button">Ver nosso catálogo</a></p>
                        </div>
                        <div class="footer">
                            <p>My Dress Belém - Sua melhor opção em aluguel de vestidos de festa.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        return res.status(200).json({ success: true, message: 'Cadastro realizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar para promoções:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}