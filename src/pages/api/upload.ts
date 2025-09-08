// src/pages/api/upload.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function upload(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const form = new IncomingForm();

  try {
    const { files } = await new Promise<{ files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ files });
      });
    });
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || !file.filepath) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    // Identifica o tipo de recurso com base no mimetype
    const resourceType = file.mimetype && file.mimetype.startsWith('video/') ? 'video' : 'image';

    const uploadResult = await cloudinary.uploader.upload(file.filepath, {
      folder: 'dresses',
      resource_type: resourceType, // Usa o tipo de recurso dinamicamente
    });

    fs.unlinkSync(file.filepath); // Exclui o arquivo temporário

    return res.status(200).json({ url: uploadResult.secure_url });

  } catch (uploadErr: any) {
    console.error('Erro geral no processo de upload:', uploadErr.message);
    return res.status(500).json({ message: 'Erro interno do servidor', error: uploadErr.message || 'Erro desconhecido' });
  }
}