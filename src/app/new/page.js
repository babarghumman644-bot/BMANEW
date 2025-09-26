"use client"

import { useEffect, useState } from 'react'

export default function Home() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
  }, [])

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
            </tr>
          ))}

        </tbody>
      </table>
    </div>
  )
}
