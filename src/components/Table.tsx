'use client';

import React from 'react';
import {
	useReactTable,
	ColumnDef,
	getCoreRowModel,
	getPaginationRowModel,
	flexRender,
} from '@tanstack/react-table';

interface GenericTableProps<TData> {
	/** Datos a mostrar en la tabla */
	data: TData[];
	/** Definición de columnas (usa la API de TanStack Table) */
	columns: ColumnDef<TData, any>[];
	/**
	 * Si se habilita la paginación (por defecto: false).
	 * Si es true, se habilitan controles para navegar entre páginas.
	 */
	enablePagination?: boolean;
	/**
	 * Tamaño de página inicial (por defecto: 10)
	 * Esto es válido solo si enablePagination es true.
	 */
	initialPageSize?: number;
}

/**
 * Componente genérico de tabla.
 *
 * Ejemplo de uso:
 *
 * ```tsx
 * const data = [
 *   { id: 1, name: "Juan", email: "juan@example.com" },
 *   { id: 2, name: "María", email: "maria@example.com" },
 *   // más datos...
 * ];
 *
 * const columns: ColumnDef<{ id: number; name: string; email: string }>[] = [
 *   {
 *     accessorKey: "id",
 *     header: "ID",
 *   },
 *   {
 *     accessorKey: "name",
 *     header: "Nombre",
 *   },
 *   {
 *     accessorKey: "email",
 *     header: "Email",
 *   },
 * ];
 *
 * <GenericTable data={data} columns={columns} enablePagination initialPageSize={5} />
 * ```
 */
export default function Table<TData>({
	data,
	columns,
	enablePagination = false,
	initialPageSize = 10,
}: GenericTableProps<TData>) {
	const table = useReactTable({
		data,
		columns,
		// Estado inicial de la paginación
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: initialPageSize,
			},
		},
		getCoreRowModel: getCoreRowModel(),
		// Si se habilita la paginación, se configura el row model de paginación
		getPaginationRowModel: enablePagination
			? getPaginationRowModel()
			: undefined,
		// manualPagination: true, // Si deseas implementar paginación server-side
	});

	return (
		<div>
			{/* Renderizado de la tabla */}
			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									style={{
										border: '1px solid #ddd',
										padding: '8px',
										textAlign: 'left',
									}}
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext()
										  )}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									style={{
										border: '1px solid #ddd',
										padding: '8px',
									}}
								>
									{flexRender(
										cell.column.columnDef.cell,
										cell.getContext()
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>

			{/* Controles de paginación (solo si se habilita) */}
			{enablePagination && (
				<div
					style={{
						marginTop: '1rem',
						display: 'flex',
						alignItems: 'center',
						gap: '1rem',
					}}
				>
					<button
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Anterior
					</button>
					<span>
						Página {table.getState().pagination.pageIndex + 1} de{' '}
						{table.getPageCount()}
					</span>
					<button
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Siguiente
					</button>
					<select
						value={table.getState().pagination.pageSize}
						onChange={(e) =>
							table.setPageSize(Number(e.target.value))
						}
					>
						{[5, 10, 20, 50].map((pageSize) => (
							<option key={pageSize} value={pageSize}>
								Mostrar {pageSize}
							</option>
						))}
					</select>
				</div>
			)}
		</div>
	);
}
