// src/pages/api/crud/banner.ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Lógica para lidar com a requisição GET
  if (req.method === 'GET') {
    try {
      // @ts-ignore
      const bannerData = await prisma.banner.findUnique({
        where: { id: 1 },
      });
      return res.status(200).json(bannerData);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar dados do banner" });
    }
  }

  // Lógica para lidar com a requisição POST
  if (req.method === 'POST') {
    const { banners } = req.body;

    // Verifique se os dados estão sendo recebidos corretamente
    console.log('Dados recebidos para salvar o banner:', { banners });

    try {
      // @ts-ignore
      const updatedBanners = await prisma.banner.upsert({
        where: { id: 1 },
        update: { banners },
        create: { id: 1, banners },
      });
      return res.status(200).json(updatedBanners);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao salvar os banners" });
    }
  }

  // Se o método não for GET nem POST, retorna 405
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}