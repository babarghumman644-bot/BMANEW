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
  try {
    await sql.connect(config)

    let query = 'SELECT * FROM Orders WHERE 1=1'
    const request = new sql.Request()

    if (req.query.orderNumber) {
      query += ' AND OrderNumber = @orderNumber'
      request.input('orderNumber', sql.VarChar, req.query.orderNumber)
    }

    if (req.query.group) {
      query += ' AND ProductGroup = @group'
      request.input('group', sql.VarChar, req.query.group)
    }

    if (req.query.date) {
      query += ' AND CAST(OrderDate AS DATE) = @date'
      request.input('date', sql.Date, req.query.date)
    }

    const result = await request.query(query)
    res.status(200).json(result.recordset)

  } catch (err) {
    console.error("SQL ERROR:", err)
    res.status(500).json({ error: err.message })
  }
}
