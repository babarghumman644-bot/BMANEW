"use client"

import { useEffect, useState } from "react";

export default function Attendance() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ Id: null, EmployeeId: "", TimeIn: "", TimeOut: "" });

  // fetch data
  const loadData = async () => {
    const res = await fetch("/api/attendance");
    const result = await res.json();
    setData(result);
  };

  useEffect(() => {
    loadData();
  }, []);

  // handle form submit (add / update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = form.Id ? "PUT" : "POST";
    await fetch("/api/attendance", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ Id: null, EmployeeId: "", TimeIn: "", TimeOut: "" });
    loadData();
  };

  // delete
  const handleDelete = async (Id) => {
    await fetch("/api/attendance", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Id }),
    });
    loadData();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Attendance Records</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Employee ID"
          value={form.EmployeeId}
          onChange={(e) => setForm({ ...form, EmployeeId: e.target.value })}
        />
        <input
          type="datetime-local"
          value={form.TimeIn}
          onChange={(e) => setForm({ ...form, TimeIn: e.target.value })}
        />
        <input
          type="datetime-local"
          value={form.TimeOut}
          onChange={(e) => setForm({ ...form, TimeOut: e.target.value })}
        />
        <button type="submit">{form.Id ? "Update" : "Add"}</button>
      </form>

      {/* Table */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Employee ID</th>
            <th>Time In</th>
            <th>Time Out</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.Id}>
              <td>{row.Id}</td>
              <td>{row.EmployeeId}</td>
              <td>{new Date(row.TimeIn).toLocaleString()}</td>
              <td>{new Date(row.TimeOut).toLocaleString()}</td>
              <td>
                <button onClick={() => setForm(row)}>Edit</button>
                <button onClick={() => handleDelete(row.Id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
