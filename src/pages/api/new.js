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
  const { startDate, endDate, sortBy } = req.query

  try {
    await sql.connect(config)

    let query = `SELECT * FROM Orders WHERE 1=1`

    if (startDate && endDate) {
      query += ` AND OrderDate BETWEEN '${startDate}' AND '${endDate}'`
    }

    if (sortBy) {
      query += ` ORDER BY ${sortBy}`
    }

    const result = await sql.query(query)
    res.status(200).json(result.recordset)
  } catch (err) {
    console.error("SQL ERROR:", err)
    res.status(500).json({ error: err.message })
  }
}
