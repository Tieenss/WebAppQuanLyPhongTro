"use client";

import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function OverviewChart({ invoices }: { invoices: any[] }) {
  // Compute revenue for the last 6 months based on PAID invoices
  const chartData = useMemo(() => {
    const dataMap = new Map();
    const now = new Date();
    
    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `T${d.getMonth() + 1}`;
      dataMap.set(label, 0);
    }

    if (invoices && invoices.length > 0) {
      invoices.forEach((inv) => {
        if (inv.status === "PAID" && inv.createdAt) {
          const invDate = new Date(inv.createdAt);
          const label = `T${invDate.getMonth() + 1}`;
          if (dataMap.has(label)) {
            dataMap.set(label, dataMap.get(label) + (inv.totalAmount || 0));
          }
        }
      });
    }

    return Array.from(dataMap, ([name, total]) => ({ name, total }));
  }, [invoices]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value / 1000000}M`}
        />
        <Tooltip 
          cursor={{ fill: '#f1f5f9' }}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          formatter={(value: any) => [`${new Intl.NumberFormat("vi-VN").format(value || 0)} đ`, "Doanh thu"]}
        />
        <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={50} />
      </BarChart>
    </ResponsiveContainer>
  );
}
