'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	getMyProfile,
	updateProfile,
	createAddress,
	updateAddress,
	deleteAddress,
	setDefaultAddress,
	getMyFiles,
} from './actions';
import {
	Loader2,
	User,
	MapPin,
	Plus,
	Edit,
	Trash2,
	CheckCircle2,
	Star,
	FileText,
	ExternalLink,
} from 'lucide-react';
import { Address } from '@prisma/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type ProfileData = Awaited<ReturnType<typeof getMyProfile>>['profile'];
type FileData = Awaited<ReturnType<typeof getMyFiles>>['files'];

interface ProfileFormData {
	firstName: string;
	lastName: string;
}

interface AddressFormData {
	street: string;
	city: string;
	state: string;
	zip: string;
	country: string;
}

export default function ProfilePage() {
	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [files, setFiles] = useState<FileData | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [editingAddress, setEditingAddress] = useState<Address | null>(null);
	const [showAddressForm, setShowAddressForm] = useState(false);
	const [showFiles, setShowFiles] = useState(false);

	const {
		register: registerProfile,
		handleSubmit: handleSubmitProfile,
		reset: resetProfile,
		formState: { errors: profileErrors },
	} = useForm<ProfileFormData>();

	const {
		register: registerAddress,
		handleSubmit: handleSubmitAddress,
		reset: resetAddress,
		formState: { errors: addressErrors },
	} = useForm<AddressFormData>();

	useEffect(() => {
		async function fetchProfile() {
			const result = await getMyProfile();
			if (result.success && result.profile) {
				setProfile(result.profile);
				resetProfile({
					firstName: result.profile.firstName || '',
					lastName: result.profile.lastName || '',
				});
			} else {
				setError(result.error || 'Error al cargar el perfil');
			}
			setLoading(false);
		}
		fetchProfile();
	}, [resetProfile]);

	const loadFiles = async () => {
		const result = await getMyFiles();
		if (result.success && result.files) {
			setFiles(result.files);
		}
	};

	useEffect(() => {
		if (showFiles && !files) {
			loadFiles();
		}
	}, [showFiles, files]);

	const onSubmitProfile = async (data: ProfileFormData) => {
		setUpdating(true);
		setError(null);
		setSuccess(null);

		const result = await updateProfile(data);

		if (result.success) {
			setSuccess('Perfil actualizado exitosamente');
			const profileResult = await getMyProfile();
			if (profileResult.success && profileResult.profile) {
				setProfile(profileResult.profile);
			}
		} else {
			setError(result.error || 'Error al actualizar el perfil');
		}

		setUpdating(false);
	};

	const onSubmitAddress = async (data: AddressFormData) => {
		setUpdating(true);
		setError(null);
		setSuccess(null);

		let result;
		if (editingAddress) {
			result = await updateAddress(editingAddress.id, data);
		} else {
			result = await createAddress(data);
		}

		if (result.success) {
			setSuccess(
				editingAddress
					? 'Dirección actualizada exitosamente'
					: 'Dirección creada exitosamente'
			);
			const profileResult = await getMyProfile();
			if (profileResult.success && profileResult.profile) {
				setProfile(profileResult.profile);
			}
			resetAddress();
			setShowAddressForm(false);
			setEditingAddress(null);
		} else {
			setError(result.error || 'Error al guardar la dirección');
		}

		setUpdating(false);
	};

	const handleDeleteAddress = async (addressId: string) => {
		if (!confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
			return;
		}

		setUpdating(true);
		setError(null);
		setSuccess(null);

		const result = await deleteAddress(addressId);

		if (result.success) {
			setSuccess('Dirección eliminada exitosamente');
			const profileResult = await getMyProfile();
			if (profileResult.success && profileResult.profile) {
				setProfile(profileResult.profile);
			}
		} else {
			setError(result.error || 'Error al eliminar la dirección');
		}

		setUpdating(false);
	};

	const handleSetDefaultAddress = async (addressId: string) => {
		setUpdating(true);
		setError(null);
		setSuccess(null);

		const result = await setDefaultAddress(addressId);

		if (result.success) {
			setSuccess('Dirección predeterminada actualizada');
			const profileResult = await getMyProfile();
			if (profileResult.success && profileResult.profile) {
				setProfile(profileResult.profile);
			}
		} else {
			setError(result.error || 'Error al actualizar dirección predeterminada');
		}

		setUpdating(false);
	};

	const handleEditAddress = (address: Address) => {
		setEditingAddress(address);
		resetAddress({
			street: address.street,
			city: address.city,
			state: address.state,
			zip: address.zip,
			country: address.country,
		});
		setShowAddressForm(true);
	};

	const handleCancelAddressForm = () => {
		setShowAddressForm(false);
		setEditingAddress(null);
		resetAddress();
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error && !profile) {
		return (
			<div className="container mx-auto py-10">
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10 space-y-6">
			<h1 className="text-2xl font-bold">Mi Perfil</h1>

			{/* Success/Error Messages */}
			{success && (
				<Alert className="border-success/30 bg-success/10">
					<CheckCircle2 className="h-4 w-4 text-success" />
					<AlertDescription className="text-success">{success}</AlertDescription>
				</Alert>
			)}
			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Profile Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Información Personal
					</CardTitle>
					<CardDescription>Actualiza tu nombre y datos personales</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="firstName">Nombre</Label>
								<Input
									id="firstName"
									{...registerProfile('firstName', {
										required: 'El nombre es requerido',
									})}
									placeholder="Tu nombre"
								/>
								{profileErrors.firstName && (
									<p className="text-sm text-destructive">
										{profileErrors.firstName.message}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Apellido</Label>
								<Input
									id="lastName"
									{...registerProfile('lastName', {
										required: 'El apellido es requerido',
									})}
									placeholder="Tu apellido"
								/>
								{profileErrors.lastName && (
									<p className="text-sm text-destructive">
										{profileErrors.lastName.message}
									</p>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={profile?.email || ''}
								disabled
								className="bg-muted"
							/>
							<p className="text-xs text-muted-foreground">
								El email no se puede cambiar
							</p>
						</div>

						<Button type="submit" disabled={updating}>
							{updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Guardar Cambios
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* File History */}
			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Historial de Archivos
							</CardTitle>
							<CardDescription>
								Archivos DXF que has subido anteriormente
							</CardDescription>
						</div>
						<Button
							onClick={() => setShowFiles(!showFiles)}
							size="sm"
							variant="outline"
						>
							{showFiles ? 'Ocultar' : 'Mostrar'}
						</Button>
					</div>
				</CardHeader>
				{showFiles && (
					<CardContent>
						{files ? (
							files.length > 0 ? (
								<div className="space-y-2">
									{files.map((file) => (
										<Card key={file.id} className="bg-muted">
											<CardContent className="p-4">
												<div className="flex justify-between items-start">
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-1">
															<FileText className="h-4 w-4 text-muted-foreground" />
															<span className="font-medium">{file.filename}</span>
														</div>
														<p className="text-xs text-muted-foreground">
															Subido el {format(new Date(file.uploadedAt), "d 'de' MMMM, yyyy", { locale: es })}
														</p>
														{file.orderItems && file.orderItems.length > 0 && (
															<div className="mt-2 flex flex-wrap gap-1">
																{file.orderItems.map((item) => (
																	<Link
																		key={item.id}
																		href={`/my-orders/${item.order.id}`}
																	>
																		<Badge
																			variant="secondary"
																			className="text-xs cursor-pointer hover:bg-gray-200"
																		>
																			Orden #{item.order.id.slice(0, 8)}
																		</Badge>
																	</Link>
																))}
															</div>
														)}
													</div>
													<Button
														asChild
														variant="ghost"
														size="sm"
													>
														<a
															href={file.filepath}
															target="_blank"
															rel="noopener noreferrer"
														>
															<ExternalLink className="h-4 w-4" />
														</a>
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									<FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
									<p>No has subido archivos todavía</p>
								</div>
							)
						) : (
							<div className="flex items-center justify-center py-8">
								<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
							</div>
						)}
					</CardContent>
				)}
			</Card>

			{/* Addresses */}
			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="h-5 w-5" />
								Direcciones de Envío
							</CardTitle>
							<CardDescription>
								Gestiona tus direcciones de envío
							</CardDescription>
						</div>
						{!showAddressForm && (
							<Button
								onClick={() => setShowAddressForm(true)}
								size="sm"
								variant="outline"
							>
								<Plus className="mr-2 h-4 w-4" />
								Agregar Dirección
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Address Form */}
					{showAddressForm && (
						<Card className="bg-muted">
							<CardHeader>
								<CardTitle className="text-lg">
									{editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<form
									onSubmit={handleSubmitAddress(onSubmitAddress)}
									className="space-y-4"
								>
									<div className="space-y-2">
										<Label htmlFor="street">Calle y Número</Label>
										<Input
											id="street"
											{...registerAddress('street', {
												required: 'La calle es requerida',
											})}
											placeholder="Ej: Av. Corrientes 1234"
										/>
										{addressErrors.street && (
											<p className="text-sm text-destructive">
												{addressErrors.street.message}
											</p>
										)}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="city">Ciudad</Label>
											<Input
												id="city"
												{...registerAddress('city', {
													required: 'La ciudad es requerida',
												})}
												placeholder="Ej: Buenos Aires"
											/>
											{addressErrors.city && (
												<p className="text-sm text-destructive">
													{addressErrors.city.message}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<Label htmlFor="state">Provincia</Label>
											<Input
												id="state"
												{...registerAddress('state', {
													required: 'La provincia es requerida',
												})}
												placeholder="Ej: CABA"
											/>
											{addressErrors.state && (
												<p className="text-sm text-destructive">
													{addressErrors.state.message}
												</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="zip">Código Postal</Label>
											<Input
												id="zip"
												{...registerAddress('zip', {
													required: 'El código postal es requerido',
												})}
												placeholder="Ej: C1043"
											/>
											{addressErrors.zip && (
												<p className="text-sm text-destructive">
													{addressErrors.zip.message}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<Label htmlFor="country">País</Label>
											<Input
												id="country"
												{...registerAddress('country', {
													required: 'El país es requerido',
												})}
												placeholder="Ej: Argentina"
											/>
											{addressErrors.country && (
												<p className="text-sm text-destructive">
													{addressErrors.country.message}
												</p>
											)}
										</div>
									</div>

									<div className="flex gap-2">
										<Button type="submit" disabled={updating}>
											{updating && (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											)}
											{editingAddress ? 'Actualizar' : 'Crear'} Dirección
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={handleCancelAddressForm}
										>
											Cancelar
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					)}

					{/* Address List */}
					{profile?.addresses && profile.addresses.length > 0 ? (
						<div className="space-y-3">
							{profile.addresses.map((address) => (
								<Card key={address.id}>
									<CardContent className="p-4">
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<MapPin className="h-4 w-4 text-muted-foreground" />
													<span className="font-medium">
														{address.street}
													</span>
													{address.isDefault && (
														<Badge variant="info">
															<Star className="h-3 w-3 mr-1" />
															Predeterminada
														</Badge>
													)}
												</div>
												<p className="text-sm text-muted-foreground">
													{address.city}, {address.state} {address.zip}
												</p>
												<p className="text-sm text-muted-foreground">
													{address.country}
												</p>
											</div>
											<div className="flex gap-2">
												{!address.isDefault && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleSetDefaultAddress(address.id)}
														disabled={updating}
														title="Marcar como predeterminada"
													>
														<Star className="h-4 w-4" />
													</Button>
												)}
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEditAddress(address)}
													disabled={updating}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteAddress(address.id)}
													disabled={updating}
													className="text-destructive hover:text-red-700"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						!showAddressForm && (
							<div className="text-center py-8 text-muted-foreground">
								<MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
								<p>No tienes direcciones guardadas</p>
								<p className="text-sm mt-2">
									Agrega una dirección para facilitar tus futuras compras
								</p>
							</div>
						)
					)}
				</CardContent>
			</Card>
		</div>
	);
}
