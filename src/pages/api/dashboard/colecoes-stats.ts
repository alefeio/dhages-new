// pages/api/dashboard/colecoes-stats.ts
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Método ${req.method} não permitido`);
    }

    // Itens mais curtidos
    const mostLiked = await prisma.colecaoItem.findMany({
      orderBy: { like: "desc" },
      take: 8, // top 8
      select: {
        id: true,
        productMark: true,
        productModel: true,
        cor: true,
        img: true,
        size: true,
        price: true,
        price_card: true,
        like: true,
        view: true,
      },
    });

    // Itens mais visualizados
    const mostViewed = await prisma.colecaoItem.findMany({
      orderBy: { view: "desc" },
      take: 8,
      select: {
        id: true,
        productMark: true,
        productModel: true,
        cor: true,
        img: true,
        size: true,
        price: true,
        price_card: true,
        like: true,
        view: true,
      },
    });

    // Adiciona slug nos itens
    const addSlugs = (items: typeof mostLiked) =>
      items.map((item) => ({
        ...item,
        slug: slugify(`${item.productMark}-${item.productModel}-${item.cor}`),
      }));

    return res.status(200).json({
      success: true,
      mostLiked: addSlugs(mostLiked),
      mostViewed: addSlugs(mostViewed),
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas das coleções:", error);
    return res.status(500).json({ success: false, message: "Erro ao buscar estatísticas." });
  } finally {
    await prisma.$disconnect();
  }
}
