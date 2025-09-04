import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Pacote, PacoteDate, PacoteFoto } from "../../../types";

const prisma = new PrismaClient();

// Função para gerar slug
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;

    switch (method) {
      case "GET":
        const pacotes = await prisma.pacote.findMany({
          include: {
            fotos: true,
            dates: true,
          },
        });
        return res.status(200).json({ success: true, pacotes });

      case "POST":
        const { title, subtitle, description, destinoId, fotos, dates } = req.body as Pacote;

        const newPacote = await prisma.pacote.create({
          data: {
            title,
            subtitle,
            description,
            destinoId,
            slug: slugify(title),
            fotos: {
              create: fotos || [],
            },
            dates: {
              create: dates || [],
            },
          },
          include: { fotos: true, dates: true },
        });
        return res.status(201).json({ success: true, data: newPacote });

      case "PUT":
        const { id, ...rest } = req.body as Pacote & { id: string };
        if (!id) return res.status(400).json({ success: false, message: "ID obrigatório" });

        const updatedPacote = await prisma.pacote.update({
          where: { id },
          data: {
            title: rest.title,
            subtitle: rest.subtitle,
            description: rest.description,
            destinoId: rest.destinoId,
            slug: slugify(rest.title),
          },
        });

        // Atualiza fotos
        if (rest.fotos) {
          await prisma.pacoteFoto.deleteMany({ where: { pacoteId: id } });
          await prisma.pacoteFoto.createMany({
            data: rest.fotos.map(f => ({ ...f, pacoteId: id })),
          });
        }

        // Atualiza datas
        if (rest.dates) {
          await prisma.pacoteDate.deleteMany({ where: { pacoteId: id } });
          await prisma.pacoteDate.createMany({
            data: rest.dates.map(d => ({ ...d, pacoteId: id })),
          });
        }

        const pacoteComAtualizacoes = await prisma.pacote.findUnique({
          where: { id },
          include: { fotos: true, dates: true },
        });

        return res.status(200).json({ success: true, data: pacoteComAtualizacoes });

      case "DELETE":
        const { id: deleteId } = req.query;
        if (!deleteId || typeof deleteId !== "string") {
          return res.status(400).json({ success: false, message: "ID obrigatório" });
        }
        await prisma.pacote.delete({ where: { id: deleteId } });
        return res.status(200).json({ success: true, message: "Pacote excluído com sucesso" });

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Método ${method} não permitido`);
    }
  } finally {
    await prisma.$disconnect();
  }
}
