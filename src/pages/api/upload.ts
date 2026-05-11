// src/pages/api/upload.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';

function extractUploadedUrl(payload: any): string | null {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;

  // formatos comuns
  const direct =
    payload.url ??
    payload.secure_url ??
    payload.secureUrl ??
    payload.location ??
    payload.publicUrl ??
    payload.public_url;
  if (typeof direct === 'string' && direct.length > 0) return direct;

  // formatos aninhados
  const nested =
    payload.data?.url ??
    payload.data?.secure_url ??
    payload.result?.url ??
    payload.result?.secure_url ??
    payload.upload?.url ??
    payload.upload?.secure_url;
  if (typeof nested === 'string' && nested.length > 0) return nested;

  return null;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function upload(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const uploadUrl = process.env.APIMG_UPLOAD_URL;
  const apiKey = process.env.APIMG_API_KEY;
  if (!uploadUrl || !apiKey) {
    return res.status(500).json({
      message: 'Upload não configurado no servidor.',
      error: 'Variáveis APIMG_UPLOAD_URL e/ou APIMG_API_KEY ausentes.',
    });
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

    const buffer = await fs.promises.readFile(file.filepath);
    const mime = file.mimetype || 'application/octet-stream';
    const filename = file.originalFilename || 'upload';

    const upstreamForm = new FormData();
    upstreamForm.append('file', new Blob([buffer], { type: mime }), filename);

    const upstreamRes = await fetch(uploadUrl, {
      method: 'POST',
      body: upstreamForm,
      headers: {
        // tenta cobrir formatos comuns (x-api-key e APIM subscription key)
        'x-api-key': apiKey,
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    });

    const contentType = upstreamRes.headers.get('content-type') || '';
    let payload: any = null;
    if (contentType.includes('application/json')) {
      payload = await upstreamRes.json().catch(() => null);
    } else {
      payload = await upstreamRes.text().catch(() => null);
    }

    const uploadedUrl = extractUploadedUrl(payload);
    if (!upstreamRes.ok || !uploadedUrl) {
      return res.status(502).json({
        message: 'Falha ao fazer upload do arquivo.',
        error:
          (payload && (payload.message || payload.error)) ||
          (typeof payload === 'string' && payload.length ? payload : undefined) ||
          `HTTP ${upstreamRes.status}`,
      });
    }

    // Exclui o arquivo temporário mesmo em sucesso
    try {
      fs.unlinkSync(file.filepath);
    } catch {
      // ignore
    }

    return res.status(200).json({ url: uploadedUrl });

  } catch (uploadErr: any) {
    console.error('Erro geral no processo de upload:', uploadErr.message);
    // tenta limpar arquivo temporário se existir
    try {
      const anyErr: any = uploadErr;
      const maybePath = anyErr?.filepath || anyErr?.file?.filepath;
      if (maybePath && typeof maybePath === 'string') fs.unlinkSync(maybePath);
    } catch {
      // ignore
    }
    return res.status(500).json({ message: 'Erro interno do servidor', error: uploadErr.message || 'Erro desconhecido' });
  }
}