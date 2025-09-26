import sql from "mssql";

const config = {
  user: "babar",
  password: "Repunzal786",
  server: "localhost",
  database: "BMADATABASE",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export default async function handler(req, res) {
  try {
    await sql.connect(config);

    // ✅ GET all records
    if (req.method === "GET") {
      const result = await sql.query`SELECT * FROM Attendance ORDER BY Id DESC`;
      return res.status(200).json(result.recordset);
    }

    // ✅ ADD new record
    if (req.method === "POST") {
      const { EmployeeId, TimeIn, TimeOut } = req.body;
      await sql.query`
        INSERT INTO Attendance (EmployeeId, TimeIn, TimeOut)
        VALUES (${EmployeeId}, ${TimeIn}, ${TimeOut})
      `;
      return res.status(201).json({ message: "Attendance added successfully" });
    }

    // ✅ UPDATE existing record
    if (req.method === "PUT") {
      const { Id, EmployeeId, TimeIn, TimeOut } = req.body;
      await sql.query`
        UPDATE Attendance
        SET EmployeeId = ${EmployeeId},
            TimeIn = ${TimeIn},
            TimeOut = ${TimeOut}
        WHERE Id = ${Id}
      `;
      return res.status(200).json({ message: "Attendance updated successfully" });
    }

    // ✅ DELETE a record
    if (req.method === "DELETE") {
      const { Id } = req.body;
      await sql.query`DELETE FROM Attendance WHERE Id = ${Id}`;
      return res.status(200).json({ message: "Attendance deleted successfully" });
    }

    // ❌ Invalid method
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("SQL ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
