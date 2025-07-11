import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new formidable.IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: true,
      filename: (name, ext, part) => {
        return `${uuidv4()}${path.extname(part.originalFilename || '')}`;
      },
    });

    const files: { originalFilename: string; newFilename: string }[] = [];

    form.on('file', (field, file) => {
      files.push({
        originalFilename: file.originalFilename || '',
        newFilename: file.newFilename,
      });
    });

    await new Promise((resolve, reject) => {
      form.parse(req, (err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    // Return URLs of uploaded files
    const urls = files.map(file => `/uploads/${file.newFilename}`);
    res.status(200).json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
