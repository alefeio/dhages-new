// pages/api/dashboard/pacotes-stats.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import type { PacoteFoto, PacoteDate, Pacote } from "types";

const prisma = new PrismaClient();

// Função auxiliar para gerar slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/-+$/, "");
}

// Função para calcular vagas ocupadas
function contarVagasOcupadas(dates?: PacoteDate[]): number {
  if (!dates) return 0;
  return dates.reduce((sum: number, d: PacoteDate) => sum + (d.vagas_total - d.vagas_disponiveis), 0);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Método ${req.method} não permitido`);
    }

    // Fotos mais curtidas (top 8)
    const mostLiked = await prisma.pacoteFoto.findMany({
      orderBy: { like: "desc" },
      take: 8,
      include: {
        pacote: {
          select: {
            id: true,
            title: true,
            slug: true,
            destinoId: true,
            dates: true,
          },
        },
      },
    });

    // Fotos mais visualizadas (top 8)
    const mostViewed = await prisma.pacoteFoto.findMany({
      orderBy: { view: "desc" },
      take: 8,
      include: {
        pacote: {
          select: {
            id: true,
            title: true,
            slug: true,
            destinoId: true,
            dates: true,
          },
        },
      },
    });

    // Top pacotes vendidos (por vagas ocupadas)
    const allPackages: (Pacote & { dates: PacoteDate[]; fotos: PacoteFoto[] })[] =
      await prisma.pacote.findMany({ include: { dates: true, fotos: true } });

    const topPackages = allPackages
      .map((pkg) => ({
        ...pkg,
        vagasOcupadas: contarVagasOcupadas(pkg.dates),
      }))
      .sort((a, b) => b.vagasOcupadas - a.vagasOcupadas)
      .slice(0, 5); // top 5 pacotes vendidos

    // Total de reservas
    const totalReservations: number = allPackages.reduce(
      (sum: number, pkg) => sum + contarVagasOcupadas(pkg.dates),
      0
    );

    // Total de inscritos na newsletter
    const totalSubscribers: number = await prisma.subscribe.count();

    // Função para adicionar slug nas fotos
    const addSlug = (
      items: (PacoteFoto & { pacote?: { title: string; slug: string; destinoId: string; dates: PacoteDate[] } })[]
    ) =>
      items.map((item) => ({
        ...item,
        slug: slugify(item.pacote?.title || item.caption || "foto"),
      }));

    return res.status(200).json({
      success: true,
      topPackages: addSlug(topPackages.flatMap((pkg) => pkg.fotos)),
      topViewedPackages: addSlug(mostViewed),
      totalReservations,
      totalSubscribers,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas dos pacotes:", error);
    return res.status(500).json({ success: false, message: "Erro ao buscar estatísticas." });
  } finally {
    await prisma.$disconnect();
  }
}
