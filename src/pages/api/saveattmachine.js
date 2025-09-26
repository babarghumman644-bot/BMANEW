import sql from "mssql";

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === "true",
    trustServerCertificate: process.env.MSSQL_TRUST_CERT === "true",
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data } = req.body; // expecting an array of logs
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: "Invalid logs data" });
  }

  try {
    const pool = await sql.connect(config);

    for (const log of data) {
      const employeeId = parseInt(log.deviceUserId);
      const recordTime = new Date(log.recordTime);

      // extract parts
      const dateStr = recordTime.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeStr = recordTime.toISOString().split("T")[1].split(".")[0]; // HH:mm:ss

      // insert row
      await pool
  .request()
  .input("EmployeeId", sql.Int, employeeId)
  .input("Date", sql.Date, dateStr)
  .input("Time", sql.VarChar, timeStr)
  .input("RawTime", sql.DateTime, recordTime)
  .query(`
    MERGE Attendance AS target
    USING (SELECT @EmployeeId AS EmployeeId, @Date AS Date) AS source
    ON target.EmployeeId = source.EmployeeId AND target.Date = source.Date
    WHEN MATCHED THEN
      UPDATE SET Time = @Time, RawTime = @RawTime
    WHEN NOT MATCHED THEN
      INSERT (EmployeeId, Date, Time, RawTime)
      VALUES (@EmployeeId, @Date, @Time, @RawTime);
  `);
  
    }

    res.status(201).json({ message: "Attendance logs saved successfully" });
  } catch (err) {
    console.error("SQL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}
