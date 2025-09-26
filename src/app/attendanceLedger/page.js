// pages/attendanceLedger.js
"use client";
import { useState } from "react";

export default function AttendanceLedgerPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLedger = async () => {
    setLoading(true);
    setError("");
    setLedger([]);

    try {
      const res = await fetch(
        `/api/attendanceLedger?employeeId=${employeeId}&month=${month}&year=${year}`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch ledger");

      setLedger(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Attendance Ledger</h1>

      <div>
        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Month (1-12)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <input
          type="number"
          placeholder="Year (e.g., 2025)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <button onClick={fetchLedger} disabled={loading}>
          {loading ? "Loading..." : "View Ledger"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {ledger.length > 0 && (
        <table border="1" cellPadding="5" style={{ marginTop: "10px" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time In</th>
              <th>Time Out</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((row, idx) => (
              <tr key={idx}>
                <td>{row.Date?.split("T")[0]}</td>
                <td>{row.TimeIn || "-"}</td>
                <td>{row.TimeOut || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
