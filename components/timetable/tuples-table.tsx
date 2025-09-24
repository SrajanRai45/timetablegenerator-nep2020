"use client"

import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Column<T> = {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
}

export function TuplesTable<T extends Record<string, any>>(props: {
  items: T[]
  columns: Column<T>[]
  emptyText?: string
}) {
  const { items, columns } = props
  if (!items || items.length === 0) {
    return <p className="text-sm opacity-75">{props.emptyText ?? "No rows yet."}</p>
  }

  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={String(c.key)}>{c.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow key={idx}>
              {columns.map((c) => (
                <TableCell key={String(c.key)}>
                  {c.render ? c.render(item) : formatCell(item[c.key as keyof T])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function formatCell(v: unknown) {
  if (v === null || v === undefined) return ""
  if (typeof v === "object") return JSON.stringify(v)
  return String(v)
}
