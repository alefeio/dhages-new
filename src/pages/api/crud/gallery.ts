// src/pages/api/crud/gallery.ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Lógica para lidar com a requisição GET
  if (req.method === 'GET') {
    try {
      const { slug } = req.query;

      if (slug) {
        // Buscar uma galeria específica pelo slug
        const gallery = await prisma.gallery.findUnique({
          where: { slug: String(slug) },
          include: { photos: true },
        });

        if (!gallery) {
          return res.status(404).json({ message: "Galeria não encontrada" });
        }
        return res.status(200).json(gallery);
      } else {
        // Buscar todas as galerias
        const galleries = await prisma.gallery.findMany({
          include: { photos: true },
        });
        return res.status(200).json(galleries);
      }
    } catch (error) {
      console.error("Erro ao buscar a galeria:", error);
      return res.status(500).json({ message: "Erro ao buscar a galeria", error: String(error) });
    }
  }

  // Lógica para lidar com a requisição POST (Criar uma nova galeria)
  if (req.method === 'POST') {
    const { title, slug, photos } = req.body;

    if (!title || !slug || !photos || !Array.isArray(photos)) {
      return res.status(400).json({ message: "Dados inválidos: título, slug e um array de fotos são obrigatórios." });
    }

    try {
      const newGallery = await prisma.gallery.create({
        data: {
          title,
          slug,
          photos: {
            create: photos.map((photo: { url: string; altText?: string }) => ({
              url: photo.url,
              altText: photo.altText,
            })),
          },
        },
        include: { photos: true },
      });
      return res.status(201).json(newGallery);
    } catch (error) {
      console.error("Erro ao criar a galeria:", error);
      return res.status(500).json({ message: "Erro ao criar a galeria", error: String(error) });
    }
  }

  // Lógica para lidar com a requisição PUT (Atualizar uma galeria existente)
  if (req.method === 'PUT') {
    const { id, title, slug, photos } = req.body;

    if (!id || (!title && !slug && !photos)) {
      return res.status(400).json({ message: "ID da galeria e pelo menos um campo para atualização são obrigatórios." });
    }

    try {
      // Começar uma transação para garantir que as operações sejam atômicas
      const updatedGallery = await prisma.$transaction(async (prisma) => {
        // Remover fotos antigas
        if (photos) {
          await prisma.galleryPhoto.deleteMany({
            where: { galleryId: id },
          });

          // Criar novas fotos
          await prisma.galleryPhoto.createMany({
            data: photos.map((photo: { url: string; altText?: string }) => ({
              url: photo.url,
              altText: photo.altText,
              galleryId: id,
            })),
          });
        }

        // Atualizar os campos da galeria principal
        const galleryUpdateData: { title?: string; slug?: string } = {};
        if (title) galleryUpdateData.title = title;
        if (slug) galleryUpdateData.slug = slug;

        if (Object.keys(galleryUpdateData).length > 0) {
          return await prisma.gallery.update({
            where: { id },
            data: galleryUpdateData,
            include: { photos: true },
          });
        }
        
        // Se apenas as fotos foram atualizadas, retornar a galeria sem modificações de título/slug
        return await prisma.gallery.findUnique({
          where: { id },
          include: { photos: true },
        });
      });

      return res.status(200).json(updatedGallery);
    } catch (error) {
      console.error("Erro ao atualizar a galeria:", error);
      return res.status(500).json({ message: "Erro ao atualizar a galeria", error: String(error) });
    }
  }

  // Lógica para lidar com a requisição DELETE
  if (req.method === 'DELETE') {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "O ID da galeria é obrigatório para exclusão." });
    }

    try {
      // Excluir a galeria e todas as suas fotos em cascata (caso o modelo não tenha a opção `onDelete: Cascade`)
      await prisma.$transaction([
        prisma.galleryPhoto.deleteMany({
          where: { galleryId: id },
        }),
        prisma.gallery.delete({
          where: { id },
        }),
      ]);

      return res.status(200).json({ message: "Galeria excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir a galeria:", error);
      return res.status(500).json({ message: "Erro ao excluir a galeria", error: String(error) });
    }
  }

  // Se o método não for suportado, retorna 405
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}