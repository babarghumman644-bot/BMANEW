// pages/api/attendance.js
import ZKLib from "node-zklib";
import sql from "mssql";

// SQL Server config
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
  try {
    // 1. Connect to biometric machine
    const zk = new ZKLib("192.168.1.80", 4370, 10000, 4000);
    await zk.createSocket();

    // 2. Get raw logs
    const logs = await zk.getAttendances();
    const records = logs?.data || [];

    if (records.length === 0) {
      return res.status(200).json({ message: "No logs found" });
    }

    // 3. Process logs → group by Employee + Date
    const attendanceMap = {}; // { "EmployeeId-Date": { EmployeeId, Date, TimeIn, TimeOut } }

    for (let log of records) {
      const employeeId = parseInt(log.deviceUserId);
      const recordTime = new Date(log.recordTime);

      const dateStr = recordTime.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeStr = recordTime.toTimeString().split(" ")[0]; // HH:mm:ss (24h)

      const key = `${employeeId}-${dateStr}`;
      if (!attendanceMap[key]) {
        attendanceMap[key] = {
          EmployeeId: employeeId,
          Date: dateStr,
          TimeIn: null,
          TimeOut: null,
        };
      }

      let entry = attendanceMap[key];

      // Rule: before 2 PM → TimeIn (take earliest only)
      if (recordTime.getHours() < 14) {
        if (!entry.TimeIn || timeStr < entry.TimeIn) {
          entry.TimeIn = timeStr;
        }
      } else {
        // Rule: after 2 PM → TimeOut (take latest only)
        if (!entry.TimeOut || timeStr > entry.TimeOut) {
          entry.TimeOut = timeStr;
        }
      }
    }

    // 4. Save entries (each EmployeeId+Date once)
    const pool = await sql.connect(config);
    let saved = 0;

    for (let key in attendanceMap) {
      const { EmployeeId, Date, TimeIn, TimeOut } = attendanceMap[key];

      // Insert into DailyAttendance
      await pool
        .request()
        .input("EmployeeId", sql.Int, EmployeeId)
        .input("Date", sql.Date, Date)
        .input("TimeIn", sql.VarChar, TimeIn) // can be null
        .input("TimeOut", sql.VarChar, TimeOut) // can be null
        .query(
          `INSERT INTO DailyAttendance (EmployeeId, Date, TimeIn, TimeOut) 
           VALUES (@EmployeeId, @Date, @TimeIn, @TimeOut)`
        );

      saved++;
    }

    // 5. Return response
    res.status(201).json({
      message: "Daily attendance saved successfully",
      totalSaved: saved,
      sample: Object.values(attendanceMap).slice(0, 5), // show first 5 entries for debug
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}
