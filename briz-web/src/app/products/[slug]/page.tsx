import type { Metadata } from "next";
import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
import { ProductDetailPage } from "@/components/product-detail/product-detail-page";
import { getProductBySlug, MAIN_PRODUCT, formatPriceNPR } from "@/data/product-detail-data";
import { SystemState } from "@/components/system-state/system-state";

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
        <main id="main-content" aria-label="Product not found">
          <SystemState
            variant="neutral"
            iconName="PackageX"
            eyebrow="404"
            title="Product not found"
            description="We couldn’t find the product you’re looking for. It may have been removed or the link might be broken."
            fullPage
            primaryAction={{
              label: "Browse products",
              href: "/category?category=Home+%26+Kitchen",
              variant: "primary",
            }}
            secondaryAction={{
              label: "Back to Home",
              href: "/",
              variant: "secondary",
            }}
          />
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

