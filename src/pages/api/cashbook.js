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
  const { method } = req;

  try {
    await sql.connect(config);

    if (method === "GET") {
      const result = await sql.query(`SELECT * FROM Ledger ORDER BY Date ASC`);
      return res.status(200).json(result.recordset);
    }

    if (method === "POST") {
      const { Date, Description, Debit, Credit, Pending, Document } = req.body;
      await sql.query`
        INSERT INTO Ledger (Date, Description, Debit, Credit, Pending, Document)
        VALUES (${Date}, ${Description}, ${Debit}, ${Credit}, ${Pending}, ${Document})
      `;
      return res.status(200).json({ message: "Entry added" });
    }

    if (method === "PUT") {
      const { Id, Date, Description, Debit, Credit, Pending, Document } = req.body;
      await sql.query`
        UPDATE Ledger
        SET Date=${Date}, Description=${Description}, Debit=${Debit}, Credit=${Credit}, Pending=${Pending}, Document=${Document}
        WHERE Id=${Id}
      `;
      return res.status(200).json({ message: "Entry updated" });
    }

    if (method === "DELETE") {
      const { Id } = req.body;
      await sql.query`DELETE FROM Ledger WHERE Id=${Id}`;
      return res.status(200).json({ message: "Entry deleted" });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  } catch (err) {
    console.error("SQL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}
