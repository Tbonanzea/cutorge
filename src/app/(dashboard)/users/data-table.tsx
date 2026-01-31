'use client';

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

interface DataTableProps<TData> {
	columns: ColumnDef<TData, any>[];
	data: TData[];
	currentPage: number;
	totalPages: number;
	baseUrl?: string;
}

export function DataTable<TData>({
	columns,
	data,
	currentPage,
	totalPages,
	baseUrl = '/users',
}: DataTableProps<TData>) {
	const router = useRouter();

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > totalPages) return;
		const url = new URL(baseUrl, window.location.origin);
		const currentParams = new URLSearchParams(window.location.search);
		currentParams.set('page', String(newPage));
		router.push(`${baseUrl}?${currentParams.toString()}`);
	};

	return (
		<div className='w-full'>
			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef
														.header,
													header.getContext()
											  )}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className='h-24 text-center'
								>
									No hay resultados.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className='flex items-center justify-end space-x-2 py-4'>
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() =>
									handlePageChange(currentPage - 1)
								}
								isActive={currentPage === 1}
							/>
						</PaginationItem>
						{pageNumbers.map((page) => (
							<PaginationItem key={page}>
								<PaginationLink
									onClick={() => handlePageChange(page)}
									isActive={page === currentPage}
								>
									{page}
								</PaginationLink>
							</PaginationItem>
						))}
						<PaginationItem>
							<PaginationNext
								onClick={() =>
									handlePageChange(currentPage + 1)
								}
								isActive={currentPage === totalPages}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}
