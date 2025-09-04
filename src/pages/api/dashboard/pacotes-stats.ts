// pages/api/dashboard/pacotes-stats.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import type { PacoteFoto, PacoteDate, Pacote } from "types";
import { contarVagasOcupadas } from "utils/contarVagasOcupadas";
import { slugify } from "utils/slugify";

const prisma = new PrismaClient();

// Tipo parcial de Pacote usado apenas para fotos (não traz tudo)
type PacoteParcial = {
  id: string;
  title: string;
  slug: string;
  destinoId: string;
  dates: PacoteDate[];
};

type PacoteFotoComPacote = PacoteFoto & {
  pacote?: PacoteParcial;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Método ${req.method} não permitido`);
    }

    // Fotos mais curtidas
    const mostLiked = await prisma.pacoteFoto.findMany({
      orderBy: { like: "desc" },
      take: 8,
      include: {
        pacote: {
          select: { id: true, title: true, slug: true, destinoId: true, dates: true },
        },
      },
    });

    // Fotos mais visualizadas
    const mostViewed = await prisma.pacoteFoto.findMany({
      orderBy: { view: "desc" },
      take: 8,
      include: {
        pacote: {
          select: { id: true, title: true, slug: true, destinoId: true, dates: true },
        },
      },
    });

    // Todos os pacotes com datas e fotos
    const allPackages = await prisma.pacote.findMany({
      include: { dates: true, fotos: true },
    });

    const topPackages = allPackages
      .map(pkg => ({
        ...pkg,
        vagasOcupadas: contarVagasOcupadas(pkg.dates),
      }))
      .sort((a, b) => b.vagasOcupadas - a.vagasOcupadas)
      .slice(0, 5);

    const totalReservations = allPackages.reduce(
      (sum, pkg) => sum + contarVagasOcupadas(pkg.dates),
      0
    );

    const totalSubscribers = await prisma.subscriber.count();

    // Função para adicionar slug nas fotos
    const addSlug = (items: PacoteFotoComPacote[]) =>
      items.map(item => ({
        ...item,
        caption: item.caption ?? undefined,
        slug: slugify(item.pacote?.title || item.caption || "foto"),
      }));

    return res.status(200).json({
      success: true,
      topPackages: addSlug(topPackages.flatMap(pkg => pkg.fotos)),
      topLikedPackages: addSlug(mostLiked),
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
