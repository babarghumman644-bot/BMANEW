// pages/api/attendance.js
import ZKLib from "node-zklib";
import sql from "mssql";

// 1. SQL Server connection settings
const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: false, // set true if using SSL
    trustServerCertificate: true, // allow self-signed certs
  },
};

export default async function handler(req, res) {
  try {
    // 2. Connect to the biometric machine (IP & Port)
    const zk = new ZKLib("192.168.1.80", 4370, 10000, 4000);
    await zk.createSocket();

    // 3. Get all attendance logs from the machine
    const logs = await zk.getAttendances();
    const records = logs?.data || [];

    if (records.length === 0) {
      return res.status(200).json({ message: "No logs found" });
    }

    // 4. Create an object to store first IN and last OUT per employee per day
    // Example: { "101-2025-09-15": { EmployeeId: 101, Date: "2025-09-15", TimeIn: "08:30:00", TimeOut: "17:30:00" } }
    const attendanceMap = {};

    for (let log of records) {
      const employeeId = parseInt(log.deviceUserId); // employee ID from machine
      const recordTime = new Date(log.recordTime); // timestamp

      const dateStr = recordTime.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeStr = recordTime.toTimeString().split(" ")[0]; // HH:mm:ss

      const key = `${employeeId}-${dateStr}`; // unique key per employee per day

      // If this is the first record for that employee+date, create an entry
      if (!attendanceMap[key]) {
        attendanceMap[key] = {
          EmployeeId: employeeId,
          Date: dateStr,
          TimeIn: null,
          TimeOut: null,
        };
      }

      let entry = attendanceMap[key];

      // Rule: before 2 PM → consider as TimeIn (take the earliest)
      if (recordTime.getHours() < 14) {
        if (!entry.TimeIn || timeStr < entry.TimeIn) {
          entry.TimeIn = timeStr;
        }
      } else {
        // Rule: after 2 PM → consider as TimeOut (take the latest)
        if (!entry.TimeOut || timeStr > entry.TimeOut) {
          entry.TimeOut = timeStr;
        }
      }
    }

    // 5. Connect to SQL Server
    const pool = await sql.connect(config);
    let saved = 0;

    // 6. Save each unique attendance entry
    for (let key in attendanceMap) {
      const { EmployeeId, Date, TimeIn, TimeOut } = attendanceMap[key];

      // ✅ Upsert logic: Update if exists, Insert if not
      await pool
        .request()
        .input("EmployeeId", sql.Int, EmployeeId)
        .input("Date", sql.Date, Date)
        .input("TimeIn", sql.VarChar, TimeIn)
        .input("TimeOut", sql.VarChar, TimeOut)
        .query(`
          MERGE DailyAttendance AS target
          USING (SELECT @EmployeeId AS EmployeeId, @Date AS Date) AS source
          ON target.EmployeeId = source.EmployeeId AND target.Date = source.Date
          WHEN MATCHED THEN
            UPDATE SET TimeIn = @TimeIn, TimeOut = @TimeOut
          WHEN NOT MATCHED THEN
            INSERT (EmployeeId, Date, TimeIn, TimeOut)
            VALUES (@EmployeeId, @Date, @TimeIn, @TimeOut);
        `);

      saved++;
    }

    // 7. Send success response
    res.status(201).json({
      message: "Daily attendance saved successfully",
      totalSaved: saved,
      sample: Object.values(attendanceMap).slice(0, 5), // show first 5 for debugging
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}
