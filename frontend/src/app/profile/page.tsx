'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLogout, HiOutlineShoppingBag, HiOutlineHeart, HiOutlineLocationMarker, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { userService } from '@/services/user.service';
import { formatDate } from '@/lib/utils';
import type { Address } from '@/types';

const emptyAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
  type: 'home' as 'home' | 'work' | 'other',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, fetchProfile } = useAuthStore();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="page-container flex flex-col items-center justify-center py-32 text-center">
        <p className="text-5xl">🔐</p>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Login Required</h2>
        <p className="mt-2 text-sm text-gray-500">Please sign in to view your profile.</p>
        <Link href="/login" className="mt-6 rounded-xl bg-primary-600 px-8 py-3 text-sm font-semibold text-white hover:bg-primary-500">
          Sign In
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const openAddForm = () => {
    setEditingAddress(null);
    setAddressForm(emptyAddress);
    setShowAddressForm(true);
  };

  const openEditForm = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
      type: addr.type,
    });
    setShowAddressForm(true);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsSavingAddress(true);
    try {
      if (editingAddress) {
        await userService.updateAddress(editingAddress._id, addressForm);
        toast.success('Address updated');
      } else {
        await userService.addAddress(addressForm);
        toast.success('Address added');
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      await fetchProfile();
    } catch {
      toast.error('Failed to save address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    setDeletingId(addressId);
    try {
      await userService.deleteAddress(addressId);
      toast.success('Address deleted');
      await fetchProfile();
    } catch {
      toast.error('Failed to delete address');
    } finally {
      setDeletingId(null);
    }
  };

  const quickLinks = [
    { href: '/orders', icon: HiOutlineShoppingBag, label: 'My Orders', desc: 'Track & manage orders' },
    { href: '/wishlist', icon: HiOutlineHeart, label: 'Wishlist', desc: 'Your saved items' },
  ];

  return (
    <div className="page-container py-6 sm:py-10">
      <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">My Profile</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-2xl font-bold text-white shadow-glow">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="mt-0.5 text-sm text-gray-500">Member since {formatDate(user.createdAt)}</p>

            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 rounded-lg bg-gray-100 dark:bg-white/5 p-3">
                <HiOutlineMail className="h-4 w-4 text-primary-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-100 dark:bg-white/5 p-3">
                <HiOutlinePhone className="h-4 w-4 text-primary-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{user.phone || 'Not provided'}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20"
            >
              <HiOutlineLogout className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Links */}
          <div className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="glass-card-sm group flex items-center gap-4 p-4 transition-all hover:border-primary-500/30 hover:shadow-glow">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 transition-colors group-hover:bg-primary-500/20">
                  <link.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{link.label}</p>
                  <p className="text-xs text-gray-500">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Saved Addresses */}
          <div className="glass-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Saved Addresses</h3>
              <button
                onClick={openAddForm}
                className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-primary-500"
              >
                <HiOutlinePlus className="h-3.5 w-3.5" /> Add
              </button>
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <div className="mb-4 rounded-xl border border-primary-500/20 bg-primary-500/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {editingAddress ? 'Edit Address' : 'New Address'}
                  </h4>
                  <button onClick={() => setShowAddressForm(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white">
                    <HiX className="h-4 w-4" />
                  </button>
                </div>
                <form onSubmit={handleSaveAddress} className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <input name="fullName" value={addressForm.fullName} onChange={handleAddressChange} className="glass-input py-2 text-sm" placeholder="Full Name *" />
                  </div>
                  <div>
                    <input name="phone" value={addressForm.phone} onChange={handleAddressChange} className="glass-input py-2 text-sm" placeholder="Phone *" />
                  </div>
                  <div className="sm:col-span-2">
                    <input name="addressLine1" value={addressForm.addressLine1} onChange={handleAddressChange} className="glass-input py-2 text-sm" placeholder="Address Line 1 *" />
                  </div>
                  <div className="sm:col-span-2">
                    <input name="addressLine2" value={addressForm.addressLine2} onChange={handleAddressChange} className="glass-input py-2 text-sm" placeholder="Address Line 2 (optional)" />
                  </div>
                  <div>
                    <input name="city" value={addressForm.city} onChange={handleAddressChange} className="glass-input py-2 text-sm" placeholder="City *" />
                  </div>
                  <div>
                    <input name="state" value={addressForm.state} onChange={handleAddressChange} className="glass-input py-2 text-sm" placeholder="State *" />
                  </div>
                  <div>
                    <input name="pincode" value={addressForm.pincode} onChange={handleAddressChange} className="glass-input py-2 text-sm" placeholder="Pincode *" maxLength={6} />
                  </div>
                  <div>
                    <select name="type" value={addressForm.type} onChange={handleAddressChange} className="glass-input py-2 text-sm">
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                        className="rounded border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/5 text-primary-500 focus:ring-primary-500/20"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Set as default</span>
                    </label>
                    <div className="ml-auto flex gap-2">
                      <button type="button" onClick={() => setShowAddressForm(false)} className="rounded-lg border border-gray-200 dark:border-white/10 px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white">
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingAddress}
                        className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-500 disabled:opacity-50"
                      >
                        {isSavingAddress ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {user.addresses && user.addresses.length > 0 ? (
              <div className="space-y-3">
                {user.addresses.map((addr) => (
                  <div key={addr._id} className="relative rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 p-4">
                    {addr.isDefault && (
                      <span className="absolute right-3 top-3 rounded-full bg-primary-500/20 px-2 py-0.5 text-[10px] font-semibold text-primary-400">
                        Default
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <HiOutlineLocationMarker className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-400" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{addr.fullName}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                          {addr.city}, {addr.state} – {addr.pincode}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{addr.phone}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded bg-gray-100 dark:bg-white/5 px-2 py-0.5 text-[10px] uppercase text-gray-500">
                            {addr.type}
                          </span>
                          <button
                            onClick={() => openEditForm(addr)}
                            className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-primary-400 hover:bg-primary-500/10"
                          >
                            <HiOutlinePencil className="h-3 w-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            disabled={deletingId === addr._id}
                            className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                          >
                            <HiOutlineTrash className="h-3 w-3" /> {deletingId === addr._id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 py-8 text-center">
                <HiOutlineLocationMarker className="mx-auto h-8 w-8 text-gray-600" />
                <p className="mt-2 text-sm text-gray-500">No addresses saved yet.</p>
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="glass-card p-5 sm:p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Account Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input type="text" defaultValue={user.name} className="glass-input pl-10 py-2.5 text-sm" readOnly />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input type="email" defaultValue={user.email} className="glass-input pl-10 py-2.5 text-sm" readOnly />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Phone</label>
                <div className="relative">
                  <HiOutlinePhone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input type="tel" defaultValue={user.phone} className="glass-input pl-10 py-2.5 text-sm" readOnly />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Account Status</label>
                <div className="flex h-[42px] items-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-4">
                  <span className={`text-sm font-medium ${user.isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {user.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
