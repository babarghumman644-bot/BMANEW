"use client";
import { useState } from "react";

export default function AttendancePage() {
  const [message, setMessage] = useState("");

  const saveAttendance = async () => {
    setMessage("Processing...");

    try {
      const res = await fetch("/api/saveattnewone"); // our new combined API
      const data = await res.json();

      if (res.ok) {
        setMessage("✅ " + data.message + " | Saved: " + data.total + " records");
      } else {
        setMessage("❌ Error: " + data.error);
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }
  };

  return (
    <div>
      <h1>Attendance System</h1>
      <button onClick={saveAttendance}>Save Attendance</button>
      <p>{message}</p>
    </div>
  );
}
