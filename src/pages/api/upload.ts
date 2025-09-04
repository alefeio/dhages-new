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
  console.log('Iniciando a API de upload.');

  if (req.method !== 'POST') {
    console.error('Método não permitido:', req.method);
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const form = new IncomingForm();

  try {
    const { fields, files } = await new Promise<{ fields: any, files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    console.log('Formulário processado. Arquivos encontrados:', files);
    
    // Acessa o arquivo da forma correta para a nova versão do formidable
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || !file.filepath) {
      console.error('Erro: Nenhum arquivo encontrado no formulário.');
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    console.log('Arquivo temporário criado em:', file.filepath);

    const uploadResult = await cloudinary.uploader.upload(file.filepath, {
      folder: 'dresses',
    });

    console.log('Upload para o Cloudinary bem-sucedido. URL:', uploadResult.secure_url);
    
    fs.unlinkSync(file.filepath); // Exclui o arquivo temporário

    return res.status(200).json({ url: uploadResult.secure_url });

  } catch (uploadErr: any) {
    console.error('Erro geral no processo de upload:', uploadErr.message);
    return res.status(500).json({ message: 'Erro interno do servidor', error: uploadErr.message || 'Erro desconhecido' });
  }
}