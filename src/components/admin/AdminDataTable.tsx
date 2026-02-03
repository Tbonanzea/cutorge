'use client';

import { useState, useCallback, useTransition, ReactNode } from 'react';
import {
	ColumnDef,
	SortingState,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	Row,
} from '@tanstack/react-table';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import {
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	Pencil,
	X,
	Check,
	Loader2,
	Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for editable columns
export type EditableColumnConfig<TData> = {
	accessorKey: keyof TData;
	type: 'text' | 'number' | 'select' | 'badge';
	options?: { value: string; label: string }[];
	editable?: boolean;
};

export type AdminDataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	currentPage: number;
	totalPages: number;
	baseUrl: string;
	idField?: keyof TData;
	editableColumns?: EditableColumnConfig<TData>[];
	onSave?: (id: string, data: Partial<TData>) => Promise<{ success: boolean; error?: string }>;
	onDelete?: (id: string) => Promise<{ success: boolean; error?: string }>;
	canDelete?: (row: TData) => boolean;
	isAdmin?: boolean;
	emptyMessage?: string;
	serverSorting?: boolean;
	sortParam?: string;
	orderParam?: string;
};

export function AdminDataTable<TData, TValue>({
	columns,
	data,
	currentPage,
	totalPages,
	baseUrl,
	idField = 'id' as keyof TData,
	editableColumns = [],
	onSave,
	onDelete,
	canDelete,
	isAdmin = true,
	emptyMessage = 'No hay resultados.',
	serverSorting = false,
	sortParam = 'sortBy',
	orderParam = 'order',
}: AdminDataTableProps<TData, TValue>) {
	const router = useRouter();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editValues, setEditValues] = useState<Record<string, any>>({});
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	// Build columns with sorting headers
	const columnsWithSorting = columns.map((col) => {
		if ('accessorKey' in col && col.header && typeof col.header === 'string') {
			return {
				...col,
				header: ({ column }: any) => (
					<Button
						variant="ghost"
						onClick={() => {
							if (serverSorting) {
								handleServerSort(col.accessorKey as string);
							} else {
								column.toggleSorting(column.getIsSorted() === 'asc');
							}
						}}
						className="h-8 px-2 -ml-2"
					>
						{col.header as string}
						{column.getIsSorted() === 'asc' ? (
							<ArrowUp className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === 'desc' ? (
							<ArrowDown className="ml-2 h-4 w-4" />
						) : (
							<ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
						)}
					</Button>
				),
			};
		}
		return col;
	});

	// Add edit actions column if editable
	const finalColumns =
		isAdmin && (editableColumns.length > 0 || onDelete)
			? [
					...columnsWithSorting,
					{
						id: 'edit-actions',
						header: 'Editar',
						cell: ({ row }: { row: Row<TData> }) => {
							const rowId = String(row.original[idField]);
							const isEditing = editingId === rowId;
							const canDeleteRow = canDelete ? canDelete(row.original) : true;

							if (isEditing) {
								return (
									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleSave(rowId)}
											disabled={isPending}
											className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
										>
											{isPending ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Check className="h-4 w-4" />
											)}
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={handleCancel}
											disabled={isPending}
											className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								);
							}

							return (
								<div className="flex items-center gap-1">
									{editableColumns.length > 0 && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleEdit(row.original)}
											className="h-8 w-8 p-0"
										>
											<Pencil className="h-4 w-4" />
										</Button>
									)}
									{onDelete && canDeleteRow && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDelete(rowId)}
											disabled={isPending}
											className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									)}
								</div>
							);
						},
					},
			  ]
			: columnsWithSorting;

	const table = useReactTable({
		data,
		columns: finalColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: serverSorting ? undefined : getSortedRowModel(),
		onSortingChange: serverSorting ? undefined : setSorting,
		state: {
			sorting: serverSorting ? [] : sorting,
		},
	});

	const handleServerSort = (columnKey: string) => {
		const currentParams = new URLSearchParams(window.location.search);
		const currentSort = currentParams.get(sortParam);
		const currentOrder = currentParams.get(orderParam) || 'asc';

		if (currentSort === columnKey) {
			currentParams.set(orderParam, currentOrder === 'asc' ? 'desc' : 'asc');
		} else {
			currentParams.set(sortParam, columnKey);
			currentParams.set(orderParam, 'asc');
		}

		currentParams.set('page', '1');
		router.push(`${baseUrl}?${currentParams.toString()}`);
	};

	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > totalPages) return;
		const currentParams = new URLSearchParams(window.location.search);
		currentParams.set('page', String(newPage));
		router.push(`${baseUrl}?${currentParams.toString()}`);
	};

	const handleEdit = useCallback((row: TData) => {
		const rowId = String(row[idField]);
		const values: Record<string, any> = {};
		editableColumns.forEach((col) => {
			values[col.accessorKey as string] = row[col.accessorKey];
		});
		setEditValues(values);
		setEditingId(rowId);
		setError(null);
	}, [editableColumns, idField]);

	const handleCancel = useCallback(() => {
		setEditingId(null);
		setEditValues({});
		setError(null);
	}, []);

	const handleSave = useCallback(
		async (id: string) => {
			if (!onSave) return;

			setError(null);
			startTransition(async () => {
				const result = await onSave(id, editValues as Partial<TData>);
				if (result.success) {
					setEditingId(null);
					setEditValues({});
				} else {
					setError(result.error || 'Error al guardar');
				}
			});
		},
		[editValues, onSave]
	);

	const handleDelete = useCallback(
		async (id: string) => {
			if (!onDelete) return;
			if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return;

			setError(null);
			startTransition(async () => {
				const result = await onDelete(id);
				if (!result.success) {
					setError(result.error || 'Error al eliminar');
				}
			});
		},
		[onDelete]
	);

	const handleValueChange = (key: string, value: any) => {
		setEditValues((prev) => ({ ...prev, [key]: value }));
	};

	// Render cell with edit mode support
	const renderCell = (row: Row<TData>, cell: any) => {
		const rowId = String(row.original[idField]);
		const isEditing = editingId === rowId;
		const columnKey = cell.column.id;

		const editableConfig = editableColumns.find(
			(col) => col.accessorKey === columnKey
		);

		if (isEditing && editableConfig && editableConfig.editable !== false) {
			const value = editValues[columnKey];

			if (editableConfig.type === 'select' && editableConfig.options) {
				return (
					<Select
						value={String(value)}
						onValueChange={(v) => handleValueChange(columnKey, v)}
					>
						<SelectTrigger className="h-8 w-[120px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{editableConfig.options.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);
			}

			if (editableConfig.type === 'number') {
				return (
					<Input
						type="number"
						value={value ?? ''}
						onChange={(e) =>
							handleValueChange(columnKey, parseFloat(e.target.value) || 0)
						}
						className="h-8 w-24"
					/>
				);
			}

			return (
				<Input
					type="text"
					value={value ?? ''}
					onChange={(e) => handleValueChange(columnKey, e.target.value)}
					className="h-8 w-full max-w-[200px]"
				/>
			);
		}

		return flexRender(cell.column.columnDef.cell, cell.getContext());
	};

	// Generate page numbers with ellipsis
	const getPageNumbers = () => {
		const pages: (number | 'ellipsis')[] = [];
		const showPages = 5;

		if (totalPages <= showPages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			pages.push(1);

			if (currentPage > 3) {
				pages.push('ellipsis');
			}

			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push('ellipsis');
			}

			pages.push(totalPages);
		}

		return pages;
	};

	return (
		<div className="w-full space-y-4">
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
					{error}
				</div>
			)}

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
											  )}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => {
								const rowId = String(row.original[idField]);
								const isEditing = editingId === rowId;

								return (
									<TableRow
										key={row.id}
										className={cn(isEditing && 'bg-muted/50')}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{renderCell(row, cell)}
											</TableCell>
										))}
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell
									colSpan={finalColumns.length}
									className="h-24 text-center"
								>
									{emptyMessage}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<div className="text-sm text-muted-foreground">
						Página {currentPage} de {totalPages}
					</div>
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={() => handlePageChange(currentPage - 1)}
									className={cn(
										currentPage === 1 && 'pointer-events-none opacity-50'
									)}
								/>
							</PaginationItem>
							{getPageNumbers().map((page, idx) =>
								page === 'ellipsis' ? (
									<PaginationItem key={`ellipsis-${idx}`}>
										<span className="px-2">...</span>
									</PaginationItem>
								) : (
									<PaginationItem key={page}>
										<PaginationLink
											onClick={() => handlePageChange(page)}
											isActive={page === currentPage}
										>
											{page}
										</PaginationLink>
									</PaginationItem>
								)
							)}
							<PaginationItem>
								<PaginationNext
									onClick={() => handlePageChange(currentPage + 1)}
									className={cn(
										currentPage === totalPages &&
											'pointer-events-none opacity-50'
									)}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}
		</div>
	);
}
