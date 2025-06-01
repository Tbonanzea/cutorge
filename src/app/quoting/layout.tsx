export default function QuotingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div>
			<h1 className='text-2xl font-bold text-center my-4'>Cotizador</h1>
			{children}
		</div>
	);
}
