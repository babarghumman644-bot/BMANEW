// pages/api/employees.js
import sql from "mssql";

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  options: { encrypt: false, trustServerCertificate: true },
};

export default async function handler(req, res) {
  try {
    const { q } = req.query; // search text
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input("Search", sql.VarChar, `${q}%`)
      .query(`
        SELECT TOP 10 EmployeeId, Name
        FROM Employees
        WHERE CAST(EmployeeId AS VARCHAR) LIKE @Search
           OR Name LIKE @Search
        ORDER BY EmployeeId
      `);

    res.status(200).json({ data: result.recordset });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}
