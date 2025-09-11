// src/pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Resend } from 'resend';
import prisma from "../../../../lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        EmailProvider({
            from: process.env.EMAIL_FROM,
            async sendVerificationRequest({ identifier: email, url, provider: { from } }) {
                await resend.emails.send({
                    from: from || "contato@dhagesturismo.com.br",
                    to: email,
                    subject: "Link de login para o D' Hages Turismo",
                    html: `Clique neste link para entrar: <a href="${url}">${url}</a>`,
                });
            },
        }),
    ],
    pages: {
        signIn: '/auth/signin',
        verifyRequest: '/auth/verify-request',
    },
    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, user }) {
            // Adiciona o role e o id do usuário ao token
            if (user) {
                const userFromDb = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { role: true },
                });
                token.id = user.id;
                (token as any).role = userFromDb?.role;
            }
            return token;
        },
        async session({ session, token }) {
            // Adiciona o id e o role do token à sessão do usuário
            if (session.user) {
                (session.user as any).id = (token as any).id;
                (session.user as any).role = (token as any).role;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);