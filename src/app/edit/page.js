"use client"
import { useState } from "react"

export default function EditOrder() {
  const [form, setForm] = useState({
    OrderNumber: "",
    ProductGroup: "",
    ProductName: "",
    Size: "",
    Quantity: ""
  })

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    await fetch("/api/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    alert("Order Updated!")
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Order (by Order Number)</h2>
      <input name="OrderNumber" placeholder="Order Number" onChange={handleChange} />
      <input name="ProductGroup" placeholder="Product Group" onChange={handleChange} />
      <input name="ProductName" placeholder="Product Name" onChange={handleChange} />
      <input name="Size" placeholder="Size" onChange={handleChange} />
      <input name="Quantity" placeholder="Quantity" onChange={handleChange} />
      <button type="submit">Update</button>
    </form>
  )
}
