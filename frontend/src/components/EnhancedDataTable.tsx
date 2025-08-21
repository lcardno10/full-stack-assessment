import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table'
import { GapminderData } from '@/utils/types'

interface EnhancedDataTableProps {
  data: GapminderData[]
  title?: string
  searchable?: boolean
  exportable?: boolean
}

const formatValue = (value: any, type: string): string => {
  if (value === null || value === undefined) return 'N/A'
  
  switch (type) {
    case 'gdpPercap':
      return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    case 'pop':
      return `${(Number(value) / 1000000).toFixed(2)}M`
    case 'lifeExp':
      return `${Number(value).toFixed(1)} years`
    default:
      return String(value)
  }
}

export default function EnhancedDataTable({ 
  data, 
  title = "Gapminder Data",
  searchable = true,
  exportable = true 
}: EnhancedDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const columns = useMemo<ColumnDef<GapminderData>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-gray-300"
        />
      ),
      enableSorting: false,
      size: 50,
    },
    {
      accessorKey: 'country',
      header: 'Country',
      cell: ({ getValue }) => (
        <div className="font-medium text-gray-900">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'continent',
      header: 'Continent',
      cell: ({ getValue }) => {
        const continent = getValue() as string
        const colors = {
          'Africa': 'bg-red-100 text-red-800',
          'Americas': 'bg-blue-100 text-blue-800',
          'Asia': 'bg-orange-100 text-orange-800',
          'Europe': 'bg-green-100 text-green-800',
          'Oceania': 'bg-purple-100 text-purple-800'
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[continent as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {continent}
          </span>
        )
      },
    },
    {
      accessorKey: 'year',
      header: 'Year',
      cell: ({ getValue }) => (
        <div className="text-gray-700">{getValue() as number}</div>
      ),
    },
    {
      accessorKey: 'lifeExp',
      header: 'Life Expectancy',
      cell: ({ getValue }) => (
        <div className="text-gray-700">{formatValue(getValue(), 'lifeExp')}</div>
      ),
    },
    {
      accessorKey: 'gdpPercap',
      header: 'GDP per Capita',
      cell: ({ getValue }) => (
        <div className="text-gray-700">{formatValue(getValue(), 'gdpPercap')}</div>
      ),
    },
    {
      accessorKey: 'pop',
      header: 'Population',
      cell: ({ getValue }) => (
        <div className="text-gray-700">{formatValue(getValue(), 'pop')}</div>
      ),
    },
  ], [])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  })

  const handleExport = () => {
    const selectedData = table.getFilteredSelectedRowModel().rows.length > 0
      ? table.getFilteredSelectedRowModel().rows.map(row => row.original)
      : table.getFilteredRowModel().rows.map(row => row.original)

    const csv = [
      Object.keys(selectedData[0] || {}),
      ...selectedData.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gapminder-data-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              Showing {table.getFilteredRowModel().rows.length} of {data.length} records
              {table.getFilteredSelectedRowModel().rows.length > 0 && 
                ` (${table.getFilteredSelectedRowModel().rows.length} selected)`
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {searchable && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search all columns..."
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}

            {exportable && (
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.getSize() }}
                  >
                    <div className="flex items-center space-x-1">
                      <span>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      {header.column.getCanSort() && (
                        <span className="text-gray-400">
                          {{
                            asc: '↑',
                            desc: '↓',
                          }[header.column.getIsSorted() as string] ?? '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {table.getRowModel().rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.01 }}
                  className={`hover:bg-gray-50 ${row.getIsSelected() ? 'bg-blue-50' : ''}`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {[10, 20, 50, 100].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
            
            <div className="flex space-x-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                ««
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                «
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                »
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                »»
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
