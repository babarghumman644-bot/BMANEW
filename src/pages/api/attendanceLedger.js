// pages/api/attendanceLedger.js
import sql from "mssql";

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { employeeId, month, year } = req.query;
  if (!employeeId || !month || !year) {
    return res.status(400).json({ error: "Missing employeeId, month or year" });
  }

  try {
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input("EmployeeId", sql.Int, employeeId)
      .input("Month", sql.Int, month)
      .input("Year", sql.Int, year)
      .query(`
        SELECT Date, TimeIn, TimeOut
        FROM DailyAttendance
        WHERE EmployeeId = @EmployeeId
          AND MONTH(Date) = @Month
          AND YEAR(Date) = @Year
        ORDER BY Date ASC
      `);

    res.status(200).json({ data: result.recordset });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}
