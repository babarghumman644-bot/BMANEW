"use client"
import { useState } from "react"

export default function DeleteOrder() {
  const [OrderNumber, setOrderNumber] = useState("")

  const handleDelete = async e => {
    e.preventDefault()
    await fetch("/api/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ OrderNumber })
    })
    alert("Order Deleted!")
  }

  return (
    <form onSubmit={handleDelete}>
      <h2>Delete Order (by Order Number)</h2>
      <input
        placeholder="Order Number"
        value={OrderNumber}
        onChange={e => setOrderNumber(e.target.value)}
      />
      <button type="submit">Delete</button>
    </form>
  )
}
