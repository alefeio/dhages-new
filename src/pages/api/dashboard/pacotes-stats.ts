// pages/api/dashboard/pacotes-stats.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

// Mapear dados do pacote para o formato do frontend
function mapPackageStats(packages: any[]) {
  return packages.map(pkg => ({
    id: pkg.id,
    caption: pkg.title,
    view: pkg.view,
    like: pkg.like,
    whatsapp: pkg.whatsapp,
    shared: pkg.shared,
  }));
}

// Mapear dados das datas e INCLUIR o nome do pacote
function mapDateStats(dates: any[]) {
  return dates.map(d => ({
    date: d.saida.toISOString().split('T')[0],
    clicks: d.whatsapp,
    // Adicionamos o título do pacote aqui
    packageName: d.pacote?.title || "Pacote Desconhecido"
  }));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Método ${req.method} não permitido`);
    }

    // --- Pacotes mais visualizados ---
    const topViewedPackagesRaw = await prisma.pacote.findMany({
      orderBy: { view: "desc" },
      take: 8,
    });

    // --- Pacotes mais curtidos ---
    const topLikedPackagesRaw = await prisma.pacote.findMany({
      orderBy: { like: "desc" },
      take: 8,
    });

    // --- Pacotes mais clicados em WhatsApp ---
    const topWhatsAppClickedPackagesRaw = await prisma.pacote.findMany({
      orderBy: { whatsapp: "desc" },
      take: 8,
    });

    // --- Pacotes mais clicados em Compartilhar ---
    const topSharedPackagesRaw = await prisma.pacote.findMany({
      orderBy: { shared: "desc" },
      take: 8,
    });

    // --- Datas mais clicadas em WhatsApp (mais informações) ---
    // Incluímos o pacote aqui para obter o título
    const topWhatsAppClickedDatesRaw = await prisma.pacoteDate.findMany({
      orderBy: { whatsapp: "desc" },
      take: 8,
      select: {
        saida: true,
        whatsapp: true,
        pacote: {
          select: { title: true }
        }
      },
    });

    // --- Total de inscritos na newsletter ---
    const totalSubscribers = await prisma.subscriber.count();

    // Mapear dados para a resposta final
    const topViewedPackages = mapPackageStats(topViewedPackagesRaw);
    const topLikedPackages = mapPackageStats(topLikedPackagesRaw);
    const topWhatsAppClickedPackages = mapPackageStats(topWhatsAppClickedPackagesRaw);
    const topSharedPackages = mapPackageStats(topSharedPackagesRaw);
    const topWhatsAppClickedDates = mapDateStats(topWhatsAppClickedDatesRaw);

    return res.status(200).json({
      success: true,
      data: {
        topViewedPackages,
        topLikedPackages,
        topWhatsAppClickedPackages,
        topSharedPackages,
        topWhatsAppClickedDates,
        totalSubscribers,
      },
    });

  } catch (error) {
    console.error("Erro ao buscar estatísticas dos pacotes:", error);
    return res.status(500).json({ success: false, message: "Erro ao buscar estatísticas." });
  } finally {
    await prisma.$disconnect();
  }
}