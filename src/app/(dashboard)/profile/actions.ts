'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * Get current user's profile with addresses
 */
export async function getMyProfile() {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			redirect('/auth/login');
		}

		const profile = await prisma.user.findUnique({
			where: { id: user.id },
			include: {
				addresses: {
					orderBy: { createdAt: 'desc' },
				},
			},
		});

		if (!profile) {
			return { success: false, error: 'Profile not found' };
		}

		return { success: true, profile };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/**
 * Get uploaded files for the current user
 */
export async function getMyFiles() {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return { success: false, error: 'Not authenticated' };
		}

		const files = await prisma.file.findMany({
			where: { userId: user.id },
			orderBy: { uploadedAt: 'desc' },
			include: {
				orderItems: {
					include: {
						order: {
							select: {
								id: true,
								status: true,
								createdAt: true,
							},
						},
					},
				},
			},
		});

		return { success: true, files };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/**
 * Update user profile (firstName, lastName)
 */
export async function updateProfile(data: { firstName: string; lastName: string }) {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return { success: false, error: 'Not authenticated' };
		}

		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: {
				firstName: data.firstName,
				lastName: data.lastName,
			},
		});

		revalidatePath('/profile');

		return { success: true, user: updatedUser };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/**
 * Create a new address for the current user
 */
export async function createAddress(data: {
	street: string;
	city: string;
	state: string;
	zip: string;
	country: string;
	isDefault?: boolean;
}) {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return { success: false, error: 'Not authenticated' };
		}

		// If this is set as default, unset all other defaults
		if (data.isDefault) {
			await prisma.address.updateMany({
				where: { userId: user.id, isDefault: true },
				data: { isDefault: false },
			});
		}

		const address = await prisma.address.create({
			data: {
				...data,
				userId: user.id,
			},
		});

		revalidatePath('/profile');

		return { success: true, address };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/**
 * Update an existing address
 */
export async function updateAddress(
	addressId: string,
	data: {
		street: string;
		city: string;
		state: string;
		zip: string;
		country: string;
		isDefault?: boolean;
	}
) {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return { success: false, error: 'Not authenticated' };
		}

		// Verify the address belongs to the current user
		const existingAddress = await prisma.address.findFirst({
			where: { id: addressId, userId: user.id },
		});

		if (!existingAddress) {
			return { success: false, error: 'Address not found or access denied' };
		}

		// If this is set as default, unset all other defaults
		if (data.isDefault) {
			await prisma.address.updateMany({
				where: { userId: user.id, isDefault: true, id: { not: addressId } },
				data: { isDefault: false },
			});
		}

		const address = await prisma.address.update({
			where: { id: addressId },
			data,
		});

		revalidatePath('/profile');

		return { success: true, address };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/**
 * Delete an address
 */
export async function deleteAddress(addressId: string) {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return { success: false, error: 'Not authenticated' };
		}

		// Verify the address belongs to the current user
		const existingAddress = await prisma.address.findFirst({
			where: { id: addressId, userId: user.id },
		});

		if (!existingAddress) {
			return { success: false, error: 'Address not found or access denied' };
		}

		await prisma.address.delete({
			where: { id: addressId },
		});

		revalidatePath('/profile');

		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(addressId: string) {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return { success: false, error: 'Not authenticated' };
		}

		// Verify the address belongs to the current user
		const existingAddress = await prisma.address.findFirst({
			where: { id: addressId, userId: user.id },
		});

		if (!existingAddress) {
			return { success: false, error: 'Address not found or access denied' };
		}

		// Unset all other defaults
		await prisma.address.updateMany({
			where: { userId: user.id, isDefault: true },
			data: { isDefault: false },
		});

		// Set this one as default
		const address = await prisma.address.update({
			where: { id: addressId },
			data: { isDefault: true },
		});

		revalidatePath('/profile');

		return { success: true, address };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
