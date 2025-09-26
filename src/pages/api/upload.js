import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import sql from 'mssql'

export const config = {
  api: {
    bodyParser: false, // ⛔ disable default body parser for file uploads
  },
}

const dbConfig = {
  user: 'babar',
  password: 'Repunzal786',
  server: 'localhost',
  database: 'BMADATABASE',
  options: { encrypt: false, trustServerCertificate: true }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = formidable({ multiples: false, uploadDir: path.join(process.cwd(), '/public/uploads'), keepExtensions: true })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'File upload error' })

    const orderNumber = fields.orderNumber
    const filePath = '/uploads/' + path.basename(files.file.filepath)

    try {
      await sql.connect(dbConfig)
      await sql.query`
        UPDATE Orders
        SET DocumentPath = ${filePath}
        WHERE OrderNumber = ${orderNumber}
      `
      return res.status(200).json({ message: 'File uploaded successfully', filePath })
    } catch (dbErr) {
      return res.status(500).json({ error: dbErr.message })
    }
  })
}
