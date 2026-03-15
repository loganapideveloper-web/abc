'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HiOutlineArrowRight, HiOutlineLightningBolt, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import type { Product, Banner, Category } from '@/types';
import { productService } from '@/services/product.service';
import { categoryService, bannerService } from '@/services/category.service';
import { useCartStore } from '@/store/cart.store';
import { useWishlistStore } from '@/store/wishlist.store';
import { useAuthStore } from '@/store/auth.store';
import ProductCard from '@/components/ui/ProductCard';
import { ProductGridSkeleton, BannerSkeleton } from '@/components/ui/Skeletons';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);

  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [featuredRes, trendingRes, bannersRes, categoriesRes, newArrivalsRes] = await Promise.allSettled([
          productService.getFeatured(),
          productService.getTrending(),
          bannerService.getAll(),
          categoryService.getAll(),
          productService.getAll({ sort: 'newest', limit: 8 }),
        ]);
        if (featuredRes.status === 'fulfilled') setFeaturedProducts(featuredRes.value);
        if (trendingRes.status === 'fulfilled') setTrendingProducts(trendingRes.value);
        if (bannersRes.status === 'fulfilled') setBanners(bannersRes.value);
        if (categoriesRes.status === 'fulfilled') setCategories(categoriesRes.value);
        if (newArrivalsRes.status === 'fulfilled') setNewArrivals(newArrivalsRes.value.products);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // Only fetch cart/wishlist if user is logged in
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [fetchCart, fetchWishlist, isAuthenticated]);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const features = [
    { icon: HiOutlineLightningBolt, title: 'Fast Delivery', desc: 'Get it within 2-3 days' },
    { icon: HiOutlineShieldCheck, title: '1 Year Warranty', desc: 'Official brand warranty' },
    { icon: HiOutlineTruck, title: 'Free Shipping', desc: 'On orders above ₹999' },
    { icon: HiOutlineRefresh, title: 'Easy Returns', desc: '7 day return policy' },
  ];

  return (
    <div className="min-h-screen">
      {/* ========== HERO BANNER ========== */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/30 via-transparent to-surface" />
        <div className="page-container relative py-4 sm:py-6">
          {isLoading ? (
            <BannerSkeleton />
          ) : banners.length > 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
              <div className="relative aspect-[21/9] sm:aspect-[3/1]">
                <Image
                  src={banners[activeBanner]?.image || '/placeholder-banner.jpg'}
                  alt={banners[activeBanner]?.title || 'Banner'}
                  fill
                  priority
                  className="object-cover transition-opacity duration-700"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-surface/80 via-surface/40 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="page-container">
                    <h1 className="max-w-lg text-2xl font-bold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
                      {banners[activeBanner]?.title}
                    </h1>
                    <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                      {banners[activeBanner]?.subtitle}
                    </p>
                    <Link
                      href="/products"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-500 hover:shadow-glow"
                    >
                      Shop Now <HiOutlineArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
              {banners.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
                  >
                    <HiOutlineChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveBanner((prev) => (prev + 1) % banners.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
                  >
                    <HiOutlineChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveBanner(idx)}
                        className={`h-2 rounded-full transition-all ${idx === activeBanner ? 'w-6 bg-primary-500' : 'w-2 bg-white/30'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-primary-950 via-surface-200 to-accent-900/20 p-8 sm:p-12 lg:p-16">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-600/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent-600/20 blur-3xl" />
              <div className="relative max-w-xl">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/20 px-3 py-1 text-xs font-semibold text-primary-400">
                  <HiOutlineLightningBolt className="h-3 w-3" /> New Arrivals
                </span>
                <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                  Next-Gen <span className="gradient-text">Smartphones</span>
                </h1>
                <p className="mt-4 text-base text-gray-500 dark:text-gray-400 sm:text-lg">
                  Explore the latest flagship and budget smartphones with cutting-edge technology at the best prices.
                </p>
                <Link
                  href="/products"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-500 hover:shadow-glow"
                >
                  Explore Mobiles <HiOutlineArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========== FEATURES BAR ========== */}
      <section className="border-y border-gray-200 dark:border-white/5 bg-surface-50/50">
        <div className="page-container grid grid-cols-2 gap-4 py-4 sm:py-6 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{feature.title}</p>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== SHOP BY CATEGORY ========== */}
      {categories.length > 0 && (
        <section className="py-8 sm:py-12">
          <div className="page-container">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  Shop by <span className="gradient-text">Category</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">Find exactly what you&apos;re looking for</p>
              </div>
              <Link
                href="/products"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary-400 transition-colors hover:text-primary-300"
              >
                View All <HiOutlineArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] p-4 transition-all hover:border-primary-500/30 hover:bg-primary-500/5 hover:shadow-glow"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5 ring-2 ring-white/10 transition-all group-hover:ring-primary-500/30">
                    <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors group-hover:text-primary-400 sm:text-sm">
                      {cat.name}
                    </p>
                    {cat.productCount > 0 && (
                      <p className="text-[10px] text-gray-600 mt-0.5">{cat.productCount} products</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== FEATURED DEALS ========== */}
      {!isLoading && featuredProducts.length > 0 && (
        <section className="py-6 sm:py-10 border-t border-gray-200 dark:border-white/5">
          <div className="page-container">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  ⚡ Featured <span className="gradient-text">Deals</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">Handpicked top deals for you</p>
              </div>
              <Link
                href="/products?sort=popular"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary-400 transition-colors hover:text-primary-300"
              >
                View All <HiOutlineArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {featuredProducts.slice(0, 8).map((product) => (
                <div key={product._id} className="w-[180px] flex-shrink-0 sm:w-[200px] md:w-[220px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            <div className="mt-4 text-center sm:hidden">
              <Link href="/products?sort=popular" className="text-sm font-medium text-primary-400 hover:text-primary-300">
                View All Deals →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ========== PROMO BANNER ========== */}
      <section className="page-container py-6">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-gradient-to-r from-primary-950 via-surface-300 to-accent-900/30 p-6 sm:p-10">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary-600/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-accent-600/20 blur-3xl" />
          <div className="relative flex flex-col items-center text-center sm:flex-row sm:text-left">
            <div className="flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-500/20 px-3 py-1 text-xs font-semibold text-accent-400">
                🔥 Limited Time Offer
              </span>
              <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                Get up to 40% off on Flagship Phones
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Upgrade to the latest tech. Offer valid while stocks last.
              </p>
            </div>
            <Link
              href="/products?sort=price_low"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-600 px-8 py-3 text-sm font-semibold text-gray-900 dark:text-white transition-all hover:bg-accent-500 hover:shadow-glow-accent sm:mt-0"
            >
              Shop Deals <HiOutlineArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== TRENDING NOW ========== */}
      {!isLoading && trendingProducts.length > 0 && (
        <section className="py-6 sm:py-10 border-t border-gray-200 dark:border-white/5">
          <div className="page-container">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  🔥 Trending <span className="gradient-text">Now</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">What everyone&apos;s buying</p>
              </div>
              <Link
                href="/products?sort=popular"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary-400 transition-colors hover:text-primary-300"
              >
                View All <HiOutlineArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {trendingProducts.slice(0, 8).map((product) => (
                <div key={product._id} className="w-[180px] flex-shrink-0 sm:w-[200px] md:w-[220px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            <div className="mt-4 text-center sm:hidden">
              <Link href="/products?sort=popular" className="text-sm font-medium text-primary-400 hover:text-primary-300">
                See What&apos;s Trending →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ========== NEW ARRIVALS GRID ========== */}
      {!isLoading && newArrivals.length > 0 && (
        <section className="py-8 sm:py-12 border-t border-gray-200 dark:border-white/5 bg-dot-pattern">
          <div className="page-container">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  🆕 New <span className="gradient-text">Arrivals</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">Fresh drops you don&apos;t want to miss</p>
              </div>
              <Link
                href="/products?sort=newest"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary-400 transition-colors hover:text-primary-300"
              >
                View All <HiOutlineArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {newArrivals.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-500 hover:shadow-glow"
              >
                Explore All Products <HiOutlineArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {isLoading && (
        <section className="py-8 sm:py-12">
          <div className="page-container">
            <ProductGridSkeleton count={8} />
          </div>
        </section>
      )}
    </div>
  );
}
