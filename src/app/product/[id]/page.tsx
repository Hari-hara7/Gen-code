"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Star, ShieldCheck, RotateCcw, Truck, Check, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";

function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#007185] font-medium">{rating.toFixed(1)}</span>
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className="h-5 w-5 fill-[#FFA41C] text-[#FFA41C]"
          />
        ))}
        {hasHalf && (
          <div className="relative h-5 w-5">
            <Star className="absolute h-5 w-5 text-[#FFA41C]" />
            <div className="absolute overflow-hidden w-[50%]">
              <Star className="h-5 w-5 fill-[#FFA41C] text-[#FFA41C]" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="h-5 w-5 text-[#FFA41C]"
          />
        ))}
      </div>
      <span className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
        {reviewCount.toLocaleString()} ratings
      </span>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const productId = params.id as string;
  const utils = api.useUtils();

  const { data: product, isLoading } = api.product.getById.useQuery(
    { id: productId },
    { enabled: !!productId }
  );

  const addToCart = api.cart.add.useMutation({
    onSuccess: () => {
      void utils.cart.get.invalidate();
      void utils.cart.count.invalidate();
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    },
  });

  const handleAddToCart = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    addToCart.mutate({ productId, quantity });
  };

  const handleBuyNow = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    addToCart.mutate(
      { productId, quantity },
      {
        onSuccess: () => {
          router.push("/checkout");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Image skeleton */}
            <div className="md:col-span-4">
              <div className="aspect-square bg-[#F0F0F0] rounded animate-pulse" />
            </div>
            {/* Details skeleton */}
            <div className="md:col-span-5 space-y-4">
              <div className="h-8 bg-[#F0F0F0] rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-[#F0F0F0] rounded w-1/2 animate-pulse" />
              <div className="h-6 bg-[#F0F0F0] rounded w-1/3 animate-pulse" />
              <div className="h-20 bg-[#F0F0F0] rounded animate-pulse" />
            </div>
            {/* Buy box skeleton */}
            <div className="md:col-span-3">
              <div className="h-64 bg-[#F0F0F0] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0F1111] mb-2">
            Product not found
          </h2>
          <p className="text-[#565959] mb-4">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            Back to shopping
          </Link>
        </div>
      </div>
    );
  }

  const dollars = Math.floor(product.price);
  const cents = Math.round((product.price - dollars) * 100)
    .toString()
    .padStart(2, "0");

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <nav className="flex items-center gap-1 text-sm text-[#565959]">
          <Link href="/" className="text-[#007185] hover:text-[#C7511F] hover:underline">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/?category=${encodeURIComponent(product.category)}`}
            className="text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#0F1111] truncate max-w-[200px]">{product.title}</span>
        </nav>
      </div>

      {/* Success banner */}
      {addedToCart && (
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="flex items-center gap-3 bg-white border border-[#067D62] rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 bg-[#067D62] rounded-full shrink-0">
              <Check className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <span className="text-lg font-medium text-[#0F1111]">Added to Cart</span>
            </div>
            <Link
              href="/cart"
              className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline"
            >
              Go to Cart
            </Link>
          </div>
        </div>
      )}

      {/* Main product layout */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Product Image */}
          <div className="md:col-span-4">
            <div className="sticky top-32">
              <div className="bg-[#F7F7F7] rounded-lg p-6 flex items-center justify-center border border-[#E7E7E7]">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={400}
                  height={400}
                  className="object-contain max-h-[400px] w-auto"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="md:col-span-5">
            {/* Title */}
            <h1 className="text-2xl font-normal text-[#0F1111] leading-tight mb-1">
              {product.title}
            </h1>

            {/* Brand / Visit store link */}
            <p className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer mb-2">
              Visit the {product.category} Store
            </p>

            {/* Rating */}
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} />

            <Separator className="my-3 bg-[#E7E7E7]" />

            {/* Price */}
            <div className="mb-1">
              <span className="text-xs text-[#565959]">Price:</span>
            </div>
            <div className="flex items-baseline mb-1">
              <span className="text-sm text-[#0F1111] relative -top-2.5">$</span>
              <span className="text-[28px] font-medium text-[#0F1111] leading-none">
                {dollars}
              </span>
              <span className="text-sm text-[#0F1111] relative -top-2.5">
                {cents}
              </span>
            </div>

            {/* Free returns */}
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm text-[#007185]">FREE Returns</span>
            </div>

            {/* Delivery */}
            <div className="text-sm text-[#0F1111] mb-4">
              <span>FREE delivery </span>
              <span className="font-bold">Tomorrow, if ordered within 12 hrs</span>
            </div>

            <Separator className="my-3 bg-[#E7E7E7]" />

            {/* Category badge */}
            <div className="mb-3">
              <Badge
                variant="secondary"
                className="bg-[#F0F2F2] text-[#0F1111] text-xs font-normal border-[#D5D9D9] rounded-sm"
              >
                {product.category}
              </Badge>
            </div>

            {/* About this item */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-[#0F1111] mb-2">About this item</h3>
              <p className="text-sm text-[#333] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <Separator className="my-3 bg-[#E7E7E7]" />

            {/* Product details table */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#0F1111] mb-2">
                Product information
              </h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-[#565959] font-medium">Category</span>
                <span className="text-[#0F1111]">{product.category}</span>

                <span className="text-[#565959] font-medium">Rating</span>
                <span className="text-[#0F1111]">{product.rating} out of 5 stars</span>

                <span className="text-[#565959] font-medium">Price</span>
                <span className="text-[#0F1111]">${product.price.toFixed(2)}</span>

                <span className="text-[#565959] font-medium">Availability</span>
                <span className={product.inStock ? "text-[#007600]" : "text-[#CC0C39]"}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>
          </div>

          {/* Buy Box (Right Sidebar) */}
          <div className="md:col-span-3">
            <div className="sticky top-32 border border-[#D5D9D9] rounded-lg p-5 space-y-3">
              {/* Price in buy box */}
              <div className="flex items-baseline">
                <span className="text-sm text-[#0F1111] relative -top-2">$</span>
                <span className="text-[24px] font-medium text-[#0F1111] leading-none">
                  {dollars}
                </span>
                <span className="text-sm text-[#0F1111] relative -top-2">
                  {cents}
                </span>
              </div>

              {/* Free returns */}
              <p className="text-sm text-[#007185]">FREE Returns</p>

              {/* Delivery */}
              <div className="text-sm text-[#0F1111]">
                <p>
                  FREE delivery{" "}
                  <span className="font-bold">Tomorrow</span>
                </p>
                <p className="text-xs text-[#565959] mt-0.5">
                  Order within 12 hrs 30 mins
                </p>
              </div>

              <Separator className="bg-[#E7E7E7]" />

              {/* Stock status */}
              {product.inStock ? (
                <p className="text-lg text-[#007600] font-medium">In Stock</p>
              ) : (
                <p className="text-lg text-[#CC0C39] font-medium">Out of Stock</p>
              )}

              {/* Quantity selector */}
              {product.inStock && (
                <div className="flex items-center gap-2">
                  <label htmlFor="quantity" className="text-sm text-[#0F1111]">
                    Qty:
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border border-[#D5D9D9] rounded-lg bg-[#F0F2F2] px-2 py-1.5 text-sm shadow-sm cursor-pointer hover:bg-[#E3E6E6] outline-none"
                  >
                    {Array.from({ length: 10 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Add to Cart button */}
              {product.inStock && (
                <Button
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending}
                  className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium rounded-full h-9 border border-[#FCD200] shadow-none text-sm"
                >
                  {addToCart.isPending ? "Adding..." : "Add to Cart"}
                </Button>
              )}

              {/* Buy Now button */}
              {product.inStock && (
                <Button
                  onClick={handleBuyNow}
                  disabled={addToCart.isPending}
                  className="w-full bg-[#FFA41C] hover:bg-[#FA8900] text-[#0F1111] font-medium rounded-full h-9 border border-[#FF8F00] shadow-none text-sm"
                >
                  Buy Now
                </Button>
              )}

              <Separator className="bg-[#E7E7E7]" />

              {/* Secure transaction */}
              <div className="space-y-2 text-xs text-[#565959]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#565959]" />
                  <span>Secure transaction</span>
                </div>
                <div className="flex items-start gap-2">
                  <Truck className="h-4 w-4 text-[#565959] mt-0.5" />
                  <div>
                    <span className="text-[#0F1111]">Ships from</span>{" "}
                    <span>Amazon.clone</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <RotateCcw className="h-4 w-4 text-[#565959] mt-0.5" />
                  <div>
                    <span className="text-[#007185]">30-day return policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
