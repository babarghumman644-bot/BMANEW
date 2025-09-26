import sql from 'mssql'

const config = {
  user: 'babar',
  password: 'Repunzal786',
  server: 'localhost',
  database: 'BMADATABASE',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
}

export default async function handler(req, res) {
  const { orderNumber } = req.query   // get from URL query like ?orderNumber=ORD-002

  if (!orderNumber) {
    return res.status(400).json({ error: "orderNumber is required" })
  }

  try {
    const pool = await sql.connect(config)
    const result = await pool
      .request()
      .input('orderNumber', sql.VarChar, orderNumber)
      .query('SELECT * FROM Orders WHERE OrderNumber = @orderNumber')

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Order not found" })
    }

    res.status(200).json(result.recordset[0])
  } catch (err) {
    console.error("SQL ERROR:", err)
    res.status(500).json({ error: err.message })
  }
}
