"use client"
import { useEffect, useState } from 'react'

export default function Home() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('orderNumber', selectedOrder)
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    alert(data.message)
    window.location.reload()
  }

  return (
    <div>
      <h1>Orders</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Group</th>
            <th>Product</th>
            <th>Size</th>
            <th>Qty</th>
            <th>Date</th>
            <th>File</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.Id}>
              <td>{order.OrderNumber}</td>
              <td>{order.ProductGroup}</td>
              <td>{order.ProductName}</td>
              <td>{order.Size}</td>
              <td>{order.Quantity}</td>
              <td>{order.OrderDate}</td>
              <td>
                {order.DocumentPath ? (
                  <a href={order.DocumentPath} target="_blank">View File</a>
                ) : 'No file'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Upload File for an Order</h2>
      <form onSubmit={handleUpload}>
        <select value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)}>
          <option value="">Select Order</option>
          {orders.map(order => (
            <option key={order.Id} value={order.OrderNumber}>
              {order.OrderNumber}
            </option>
          ))}
        </select>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
    </div>
  )
}
