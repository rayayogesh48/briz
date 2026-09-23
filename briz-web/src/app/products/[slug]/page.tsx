import type { Metadata } from "next";
import Link from "next/link";
import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
import { ProductDetailPage } from "@/components/product-detail/product-detail-page";
import { getProductBySlug, MAIN_PRODUCT, formatPriceNPR } from "@/data/product-detail-data";

interface ProductRouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug) || MAIN_PRODUCT;

  return {
    title: `${product.name} — Rs. ${product.currentPrice.toLocaleString("en-IN")} on Briz`,
    description: `${(product.shortSummary || product.description).slice(0, 160)} Sold by ${product.seller.name} in ${product.seller.address}. Order online or pickup in store.`,
    openGraph: {
      title: `${product.name} | Briz Marketplace`,
      description: `${(product.shortSummary || product.description).slice(0, 160)} Available for ${formatPriceNPR(product.currentPrice)} in Kathmandu.`,
      images: [
        {
          url: product.images[0] || "/products/bottle-main.svg",
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductRoute({ params }: ProductRouteProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <>
        <BrizHeader />
        <main className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-md flex flex-col items-center gap-4">
            <span className="text-5xl">🔍</span>
            <h1 className="text-2xl font-bold text-[#202020]">Product not found</h1>
            <p className="text-sm text-[#646464] leading-relaxed">
              We couldn’t find the product you’re looking for. It may have been removed or the link might be broken.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/category?category=Home+%26+Kitchen"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#3e63dd] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#3354c7] transition"
              >
                Browse products
              </Link>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#ebebeb] bg-white px-5 text-sm font-semibold text-[#202020] hover:bg-slate-50 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
        <BrizFooter />
      </>
    );
  }

  return (
    <>
      <BrizHeader categoryContext={product.category} />
      <ProductDetailPage product={product} />
      <BrizFooter />
    </>
  );
}

