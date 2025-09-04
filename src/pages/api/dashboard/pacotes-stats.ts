// pages/api/dashboard/pacotes-stats.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import type { PacoteFoto, PacoteDate } from "types";
import { contarVagasOcupadas } from "utils/contarVagasOcupadas";
import { slugify } from "utils/slugify";

const prisma = new PrismaClient();

// Tipo parcial de Pacote usado apenas para fotos
type PacoteParcial = {
  id: string;
  title: string;
  slug: string;
  destinoId: string;
  description: unknown; // compatível com o tipo original
  fotos: PacoteFoto[];  // necessário para compatibilidade
  dates: (Omit<PacoteDate, "status"> & { status: "disponivel" | "esgotado" | "cancelado" })[];
};

type PacoteFotoComPacote = PacoteFoto & {
  pacote?: PacoteParcial;
};

// Função para mapear e corrigir tipos do raw do Prisma
function mapPacoteFoto(raw: any[]): PacoteFotoComPacote[] {
  return raw.map(f => ({
    ...f,
    pacote: f.pacote
      ? {
        ...f.pacote,
        description: f.pacote.description as unknown,
        fotos: f.pacote.fotos ?? [],
        dates: f.pacote.dates.map((d: any) => ({
          ...d,
          // Converte status string para literal do tipo PacoteDate
          status:
            d.status === "disponivel" || d.status === "esgotado" || d.status === "cancelado"
              ? d.status
              : "disponivel",
        })) as PacoteDate[],
      }
      : undefined,
  }));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Método ${req.method} não permitido`);
    }

    // --- Fotos mais curtidas ---
    const mostLikedRaw = await prisma.pacoteFoto.findMany({
      orderBy: { like: "desc" },
      take: 8,
      include: {
        pacote: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            destinoId: true,
            fotos: true,
            dates: true,
          },
        },
      },
    });
    const mostLiked: PacoteFotoComPacote[] = mapPacoteFoto(mostLikedRaw);

    // --- Fotos mais visualizadas ---
    const mostViewedRaw = await prisma.pacoteFoto.findMany({
      orderBy: { view: "desc" },
      take: 8,
      include: {
        pacote: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            destinoId: true,
            fotos: true,
            dates: true,
          },
        },
      },
    });
    const mostViewed: PacoteFotoComPacote[] = mapPacoteFoto(mostViewedRaw);

    // --- Todos os pacotes com datas e fotos ---
    const allPackagesRaw = await prisma.pacote.findMany({ include: { dates: true, fotos: true } });
    const allPackages = allPackagesRaw.map(pkg => ({
      ...pkg,
      dates: pkg.dates.map(d => ({
        ...d,
        status: d.status as "disponivel" | "esgotado" | "cancelado",
      })),
    }));

    // Top pacotes por vagas ocupadas
    const topPackages = allPackages
      .map(pkg => ({ ...pkg, vagasOcupadas: contarVagasOcupadas(pkg.dates) }))
      .sort((a, b) => b.vagasOcupadas - a.vagasOcupadas)
      .slice(0, 5);

    const totalReservations = allPackages.reduce(
      (sum, pkg) => sum + contarVagasOcupadas(pkg.dates),
      0
    );
    const totalSubscribers = await prisma.subscriber.count();

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
