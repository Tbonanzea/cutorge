import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
	console.log('🌱 Starting database seeding...');

	// Check if there are existing orders (to avoid breaking foreign keys)
	const orderCount = await prisma.order.count();

	if (orderCount === 0) {
		// Safe to delete materials if no orders exist
		console.log('🗑️  Clearing existing materials...');
		await prisma.materialType.deleteMany();
		await prisma.material.deleteMany();
	} else {
		console.log(`⚠️  Skipping material deletion - ${orderCount} orders exist`);
	}

	console.log('📦 Seeding materials and material types...');

	// Acero Inoxidable
	const aceroInoxidable = await prisma.material.create({
		data: {
			name: 'Acero Inoxidable',
			description: 'Acero inoxidable 304 de alta calidad',
			types: {
				create: [
					{
						width: 1000,
						length: 2000,
						height: 1.5,
						pricePerUnit: 150.0,
						massPerUnit: 23.55,
						stock: 50,
						errorMargin: 0.1,
						maxCutLength: 1900,
						minCutLength: 50,
						maxCutWidth: 950,
						minCutWidth: 50,
					},
					{
						width: 1000,
						length: 2000,
						height: 3.0,
						pricePerUnit: 280.0,
						massPerUnit: 47.1,
						stock: 30,
						errorMargin: 0.1,
						maxCutLength: 1900,
						minCutLength: 50,
						maxCutWidth: 950,
						minCutWidth: 50,
					},
					{
						width: 1220,
						length: 2440,
						height: 6.0,
						pricePerUnit: 650.0,
						massPerUnit: 142.0,
						stock: 15,
						errorMargin: 0.15,
						maxCutLength: 2340,
						minCutLength: 50,
						maxCutWidth: 1170,
						minCutWidth: 50,
					},
				],
			},
		},
	});

	// Aluminio
	const aluminio = await prisma.material.create({
		data: {
			name: 'Aluminio',
			description: 'Aluminio 6061-T6 para aplicaciones estructurales',
			types: {
				create: [
					{
						width: 1000,
						length: 2000,
						height: 2.0,
						pricePerUnit: 120.0,
						massPerUnit: 10.8,
						stock: 40,
						errorMargin: 0.1,
						maxCutLength: 1950,
						minCutLength: 50,
						maxCutWidth: 950,
						minCutWidth: 50,
					},
					{
						width: 1000,
						length: 2000,
						height: 4.0,
						pricePerUnit: 220.0,
						massPerUnit: 21.6,
						stock: 25,
						errorMargin: 0.1,
						maxCutLength: 1950,
						minCutLength: 50,
						maxCutWidth: 950,
						minCutWidth: 50,
					},
					{
						width: 1220,
						length: 2440,
						height: 5.0,
						pricePerUnit: 380.0,
						massPerUnit: 40.5,
						stock: 20,
						errorMargin: 0.12,
						maxCutLength: 2390,
						minCutLength: 50,
						maxCutWidth: 1170,
						minCutWidth: 50,
					},
				],
			},
		},
	});

	// Acero al Carbono
	const aceroCarbono = await prisma.material.create({
		data: {
			name: 'Acero al Carbono',
			description: 'Acero A36 de uso general',
			types: {
				create: [
					{
						width: 1000,
						length: 2000,
						height: 3.0,
						pricePerUnit: 90.0,
						massPerUnit: 47.1,
						stock: 60,
						errorMargin: 0.15,
						maxCutLength: 1900,
						minCutLength: 50,
						maxCutWidth: 950,
						minCutWidth: 50,
					},
					{
						width: 1220,
						length: 2440,
						height: 6.0,
						pricePerUnit: 200.0,
						massPerUnit: 142.0,
						stock: 35,
						errorMargin: 0.2,
						maxCutLength: 2340,
						minCutLength: 50,
						maxCutWidth: 1170,
						minCutWidth: 50,
					},
					{
						width: 1500,
						length: 3000,
						height: 10.0,
						pricePerUnit: 480.0,
						massPerUnit: 353.0,
						stock: 12,
						errorMargin: 0.25,
						maxCutLength: 2900,
						minCutLength: 100,
						maxCutWidth: 1450,
						minCutWidth: 100,
					},
				],
			},
		},
	});

	// Cobre
	const cobre = await prisma.material.create({
		data: {
			name: 'Cobre',
			description: 'Cobre electrolítico 99.9% puro',
			types: {
				create: [
					{
						width: 600,
						length: 1200,
						height: 1.0,
						pricePerUnit: 280.0,
						massPerUnit: 10.68,
						stock: 25,
						errorMargin: 0.08,
						maxCutLength: 1150,
						minCutLength: 30,
						maxCutWidth: 570,
						minCutWidth: 30,
					},
					{
						width: 1000,
						length: 2000,
						height: 2.0,
						pricePerUnit: 520.0,
						massPerUnit: 35.6,
						stock: 18,
						errorMargin: 0.1,
						maxCutLength: 1950,
						minCutLength: 50,
						maxCutWidth: 950,
						minCutWidth: 50,
					},
				],
			},
		},
	});

	// Latón
	const laton = await prisma.material.create({
		data: {
			name: 'Latón',
			description: 'Latón CuZn37 para decoración',
			types: {
				create: [
					{
						width: 600,
						length: 1200,
						height: 1.5,
						pricePerUnit: 190.0,
						massPerUnit: 10.2,
						stock: 22,
						errorMargin: 0.08,
						maxCutLength: 1150,
						minCutLength: 30,
						maxCutWidth: 570,
						minCutWidth: 30,
					},
					{
						width: 1000,
						length: 2000,
						height: 3.0,
						pricePerUnit: 340.0,
						massPerUnit: 40.8,
						stock: 15,
						errorMargin: 0.1,
						maxCutLength: 1950,
						minCutLength: 50,
						maxCutWidth: 950,
						minCutWidth: 50,
					},
				],
			},
		},
	});

	// Extra Services (upsert to avoid conflicts)
	console.log('🔧 Seeding extra services...');

	const extraServices = [
		{
			name: 'Grabado láser',
			description: 'Personaliza tu pieza con texto o diseños grabados',
			price: 15,
			unit: 'por pieza',
			isActive: true,
		},
		{
			name: 'Pintura/Acabado',
			description: 'Aplicación de pintura o acabados especiales',
			price: 25,
			unit: 'por pieza',
			isActive: true,
		},
		{
			name: 'Ensamblaje',
			description: 'Armado de piezas múltiples',
			price: 50,
			unit: 'por proyecto',
			isActive: true,
		},
		{
			name: 'Entrega Express',
			description: 'Entrega en 24-48 horas',
			price: 100,
			unit: 'por pedido',
			isActive: true,
		},
		{
			name: 'Empaque Especial',
			description: 'Empaque personalizado para presentación',
			price: 20,
			unit: 'por pedido',
			isActive: true,
		},
		{
			name: 'Revisión de Diseño',
			description: 'Análisis y optimización del diseño para corte',
			price: 75,
			unit: 'por proyecto',
			isActive: true,
		},
	];

	for (const extra of extraServices) {
		await prisma.extraService.upsert({
			where: { name: extra.name },
			update: extra,
			create: extra,
		});
	}

	console.log('✅ Seeding complete!');
	console.log(`   - Created ${await prisma.material.count()} materials`);
	console.log(`   - Created ${await prisma.materialType.count()} material types`);
	console.log(`   - Created ${await prisma.extraService.count()} extra services`);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error('❌ Error during seeding:', e);
		await prisma.$disconnect();
		process.exit(1);
	});
