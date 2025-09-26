// pages/attendanceLedger.js
"use client";
import { useState } from "react";

export default function AttendanceLedgerPage() {
  // Input fields
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(""); // e.g. 9 for September
  const [year, setYear] = useState("");   // e.g. 2025

  // Data + UI states
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch ledger data from backend API
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

      // Generate full month days (auto-complete missing ones)
      const daysInMonth = new Date(year, month, 0).getDate(); // total days
      const allDays = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;

        // find entry for this date
        const entry = data.data.find((row) =>
          row.Date.startsWith(dateStr)
        );

        allDays.push({
          Date: dateStr,
          TimeIn: entry ? formatTime(entry.TimeIn) : "-",
          TimeOut: entry ? formatTime(entry.TimeOut) : "-",
        });
      }

      setLedger(allDays);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format time as HH:mm:ss (24hr)
  const formatTime = (timeString) => {
    if (!timeString) return "-";
    const d = new Date(timeString);
    if (!isNaN(d.getTime())) {
      return d.toTimeString().split(" ")[0]; // HH:mm:ss
    }
    return timeString; // fallback
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Attendance Ledger</h1>

      {/* Search Form */}
      <div style={{ marginBottom: "10px" }}>
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

      {/* Error message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Ledger Table */}
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
                <td>{row.Date}</td>
                <td>{row.TimeIn}</td>
                <td>{row.TimeOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
