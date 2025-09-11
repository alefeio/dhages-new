// pages/api/dashboard/pacotes-stats.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import type { PacoteMidia, PacoteDate } from "types";
import { contarVagasOcupadas } from "utils/contarVagasOcupadas";

const prisma = new PrismaClient();

// Função para gerar slug único
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/-+$/, "");
}

// Tipo parcial de Pacote usado apenas para fotos
type PacoteParcial = {
  id: string;
  title: string;
  slug: string;
  destinoId: string;
  description: unknown;
  fotos: PacoteMidia[];
  dates: (Omit<PacoteDate, "status"> & { status: "disponivel" | "esgotado" | "cancelado" })[];
};

type PacoteFotoComPacote = PacoteMidia & {
  pacote?: PacoteParcial;
};

// Mapear raw do Prisma para PacoteFotoComPacote
function mapPacoteFoto(raw: any[]): PacoteFotoComPacote[] {
  return raw.map(f => ({
    ...f,
    pacoteId: f.pacoteId, // <--- garante que PacoteFotoComPacote tenha pacoteId
    pacote: f.pacote
      ? {
        ...f.pacote,
        description: f.pacote.description as unknown,
        fotos: f.pacote.fotos ?? [],
        dates: f.pacote.dates.map((d: any) => ({
          ...d,
          saida: new Date(d.saida),
          retorno: new Date(d.retorno),
          status:
            d.status === "disponivel" || d.status === "esgotado" || d.status === "cancelado"
              ? d.status
              : "disponivel",
        })) as PacoteDate[],
      }
      : undefined,
  }));
}

// Adicionar slug único para fotos/pacotes
function addSlug(items: PacoteFotoComPacote[]): PacoteFotoComPacote[] {
  return items.map(item => ({
    ...item,
    caption: item.caption ?? undefined,
    slug: slugify(`${item.pacote?.title || item.caption || "foto"}-${item.id}`),
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
          select: { id: true, title: true, slug: true, description: true, destinoId: true, fotos: true, dates: true },
        },
      },
    });
    const mostLiked = mapPacoteFoto(mostLikedRaw);

    // --- Fotos mais visualizadas ---
    const mostViewedRaw = await prisma.pacoteFoto.findMany({
      orderBy: { view: "desc" },
      take: 8,
      include: {
        pacote: {
          select: { id: true, title: true, slug: true, description: true, destinoId: true, fotos: true, dates: true },
        },
      },
    });
    const mostViewed = mapPacoteFoto(mostViewedRaw);

    // --- Todos os pacotes ---
    const allPackagesRaw = await prisma.pacote.findMany({ include: { dates: true, fotos: true } });
    const allPackages = allPackagesRaw.map(pkg => ({
      ...pkg,
      dates: pkg.dates.map(d => ({
        ...d,
        saida: new Date(d.saida),
        retorno: new Date(d.retorno),
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
