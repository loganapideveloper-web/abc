'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HiOutlineHeart, HiHeart, HiStar, HiOutlineShoppingCart, HiOutlineEye } from 'react-icons/hi';
import type { Product } from '@/types';
import { formatPrice, getStockStatus, getRatingColor } from '@/lib/utils';
import { useWishlistStore } from '@/store/wishlist.store';
import { useCartStore } from '@/store/cart.store';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  const wishlisted = isInWishlist(product._id);
  const stockStatus = getStockStatus(product.stock);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (wishlisted) {
        await removeFromWishlist(product._id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product._id);
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product._id);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const savingsAmount = product.originalPrice > product.price ? product.originalPrice - product.price : 0;

  return (
    <Link href={`/product/${product.slug}`} prefetch={true} className="group block">
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.03] transition-all duration-300 hover:border-primary-500/25 hover:bg-gray-100 dark:bg-white/[0.06] hover:shadow-[0_8px_40px_rgba(99,102,241,0.12)]">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-surface-200/80 to-surface-300/60">
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q=="
          />

          {/* Top-left badges */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {product.discount > 0 && (
              <span className="inline-flex items-center rounded-lg bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-md">
                {product.discount}% OFF
              </span>
            )}
            {product.isTrending && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-md">
                🔥 Trending
              </span>
            )}
            {!product.inStock && (
              <span className="inline-flex items-center rounded-lg bg-red-500/90 px-2 py-0.5 text-[11px] font-bold text-white shadow-md">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist button — always visible */}
          <button
            onClick={handleWishlist}
            className={`absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 ${
              wishlisted
                ? 'border-pink-500/40 bg-pink-500/20 shadow-lg'
                : 'border-gray-300 dark:border-white/20 bg-black/30 opacity-0 group-hover:opacity-100'
            } hover:scale-110`}
          >
            {wishlisted ? (
              <HiHeart className="h-[18px] w-[18px] text-pink-500" />
            ) : (
              <HiOutlineHeart className="h-[18px] w-[18px] text-gray-900 dark:text-white" />
            )}
          </button>

          {/* Hover action overlay */}
          <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pb-3 pt-10 transition-transform duration-300 ease-out group-hover:translate-y-0">
            {product.inStock && (
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:bg-primary-500 active:scale-95"
              >
                <HiOutlineShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="sm:hidden">Cart</span>
              </button>
            )}
            <Link
              href={`/product/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 dark:border-white/20 bg-gray-200 dark:bg-white/10 px-3 py-2.5 text-xs font-semibold text-gray-900 dark:text-white backdrop-blur-sm transition-all hover:bg-gray-200 dark:hover:bg-white/20 active:scale-95"
            >
              <HiOutlineEye className="h-4 w-4" />
              <span className="hidden sm:inline">View</span>
            </Link>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          {/* Brand */}
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-400/80">
            {product.brand}
          </p>

          {/* Product Name */}
          <h3 className="mt-1.5 line-clamp-2 text-[13px] font-semibold leading-snug text-gray-700 dark:text-gray-200 transition-colors group-hover:text-gray-900 dark:hover:text-gray-900 dark:hover:text-white sm:text-sm">
            {product.name}
          </h3>

          {/* Key Specs */}
          {(product.specifications?.ram || product.specifications?.storage || product.specifications?.battery) && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.specifications?.ram && (
                <span className="rounded-md bg-gray-100 dark:bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  {product.specifications.ram}
                </span>
              )}
              {product.specifications?.storage && (
                <span className="rounded-md bg-gray-100 dark:bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  {product.specifications.storage}
                </span>
              )}
              {product.specifications?.battery && (
                <span className="rounded-md bg-gray-100 dark:bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  {product.specifications.battery}
                </span>
              )}
            </div>
          )}

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="mt-2.5 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white ${getRatingColor(product.ratings)}`}>
                {product.ratings.toFixed(1)}
                <HiStar className="h-3 w-3" />
              </span>
              <span className="text-[11px] text-gray-500">
                ({product.numReviews.toLocaleString()})
              </span>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price Section */}
          <div className="mt-3 border-t border-gray-100 dark:border-white/[0.05] pt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:text-xl">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {savingsAmount > 0 && (
              <p className="mt-0.5 text-[11px] font-medium text-emerald-400">
                Save {formatPrice(savingsAmount)}
              </p>
            )}

            {/* Stock status */}
            {product.inStock && (
              <p className={`mt-1.5 text-[11px] font-semibold ${stockStatus.color}`}>
                {stockStatus.label}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
