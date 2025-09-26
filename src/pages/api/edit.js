import sql from 'mssql'

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === 'true',       // converts string "false" → boolean
    trustServerCertificate: process.env.MSSQL_TRUST_CERT === 'true',
  },
}

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { OrderNumber, ProductGroup, ProductName, Size, Quantity } = req.body

  try {
    await sql.connect(config)
    await sql.query`
      UPDATE Orders
      SET ProductGroup=${ProductGroup},
          ProductName=${ProductName},
          Size=${Size},
          Quantity=${Quantity}
      WHERE OrderNumber=${OrderNumber}
    `
    res.status(200).json({ message: 'Order updated successfully' })
  } catch (err) {
    console.error("SQL ERROR:", err)
    res.status(500).json({ error: err.message })
  }
}
