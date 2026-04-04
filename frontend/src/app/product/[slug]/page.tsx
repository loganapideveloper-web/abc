import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return { title: 'Product Not Found' };
  }

  const price = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const title = `${product.name} – Buy at ${price}`;
  const description =
    product.shortDescription ||
    product.description ||
    `Buy ${product.name} online at AMOHA Mobiles. ${product.brand} smartphone with ${product.specifications?.ram || ''} RAM, ${product.specifications?.storage || ''} storage.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: product.images?.[0]
        ? [{ url: product.images[0], width: 800, height: 800, alt: product.name }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
    alternates: {
      canonical: `/product/${slug}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.shortDescription || product.description,
        image: product.images || [],
        brand: { '@type': 'Brand', name: product.brand },
        sku: product._id,
        offers: {
          '@type': 'Offer',
          url: `https://amohamobiles.com/product/${slug}`,
          priceCurrency: 'INR',
          price: product.price,
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: { '@type': 'Organization', name: 'AMOHA Mobiles' },
        },
        ...(product.ratings > 0 && product.numReviews > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.ratings,
                reviewCount: product.numReviews,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient />
    </>
  );
}
