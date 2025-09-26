// pages/api/attendance.js
import ZKLib from 'node-zklib';

export default async function handler(req, res) {
  try {
    let zkInstance = new ZKLib('192.168.1.80', 4370, 10000, 4000);

    // connect to machine
    await zkInstance.createSocket();

    // get attendance logs
    let logs = await zkInstance.getAttendances();

    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
