"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, Package } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const utils = api.useUtils();

  const { data: wishlistItems, isLoading } = api.wishlist.get.useQuery(
    undefined,
    { enabled: !!session }
  );

  const removeFromWishlist = api.wishlist.remove.useMutation({
    onSuccess: () => {
      void utils.wishlist.get.invalidate();
      void utils.wishlist.count.invalidate();
      toast.info("Removed from Wishlist");
    },
  });

  const addToCart = api.cart.add.useMutation({
    onSuccess: () => {
      void utils.cart.get.invalidate();
      void utils.cart.count.invalidate();
      toast.success("Added to Cart");
    },
  });

  const handleRemove = (productId: string) => {
    removeFromWishlist.mutate({ productId });
  };

  const handleAddToCart = (productId: string) => {
    if (!session) {
      router.push("/login");
      return;
    }
    addToCart.mutate({ productId, quantity: 1 });
  };

  const handleMoveToCart = (productId: string) => {
    if (!session) {
      router.push("/login");
      return;
    }
    addToCart.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => {
          void utils.cart.get.invalidate();
          void utils.cart.count.invalidate();
          removeFromWishlist.mutate({ productId });
          toast.success("Moved to Cart");
        },
      }
    );
  };

  // Not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#EAEDED]">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <Heart className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#0F1111] mb-2">
              Your Wishlist
            </h1>
            <p className="text-[#565959] mb-6">
              Sign in to view and manage your saved items.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium rounded-full px-10 h-10 border border-[#FCD200] shadow-none"
            >
              Sign in to your account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#EAEDED]">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-4">
                  <Skeleton className="w-[140px] h-[140px] rounded shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-9 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !wishlistItems || wishlistItems.length === 0;

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-[28px] font-normal text-[#0F1111]">
              Your Wishlist
            </h1>
            {!isEmpty && (
              <span className="text-sm text-[#565959]">
                {wishlistItems.length}{" "}
                {wishlistItems.length === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          <Separator className="bg-[#E7E7E7] mb-4" />

          {/* Empty State */}
          {isEmpty ? (
            <div className="py-16 text-center">
              <div className="flex justify-center mb-6">
                <Heart className="h-24 w-24 text-gray-200" />
              </div>
              <h2 className="text-xl font-bold text-[#0F1111] mb-2">
                Your Wishlist is empty
              </h2>
              <p className="text-sm text-[#565959] mb-6 max-w-md mx-auto">
                Add items you love to your Wishlist. Review them anytime and
                easily move them to your cart.
              </p>
              <Link href="/">
                <Button className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium rounded-full px-8 h-10 border border-[#FCD200] shadow-none">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              {/* Wishlist Items */}
              {wishlistItems.map((item, index) => {
                const product = item.product;
                const dollars = Math.floor(product.price);
                const cents = Math.round(
                  (product.price - dollars) * 100
                )
                  .toString()
                  .padStart(2, "0");

                return (
                  <div key={item.id}>
                    <div className="flex gap-4 py-4">
                      {/* Product Image */}
                      <Link
                        href={`/product/${product.id}`}
                        className="shrink-0"
                      >
                        <div className="w-[140px] h-[140px] bg-[#F7F7F7] rounded flex items-center justify-center overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.title}
                            width={140}
                            height={140}
                            className="object-contain max-h-[130px] w-auto"
                          />
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <Link href={`/product/${product.id}`}>
                          <h3 className="text-base text-[#0F1111] leading-tight hover:text-[#C7511F] line-clamp-2 mb-1">
                            {product.title}
                          </h3>
                        </Link>

                        {/* Category */}
                        <span className="inline-block text-xs bg-[#F0F2F2] text-[#0F1111] border border-[#D5D9D9] rounded px-2 py-0.5 mb-2">
                          {product.category}
                        </span>

                        {/* Price */}
                        <div className="flex items-baseline mb-1">
                          <span className="text-xs text-[#0F1111] relative -top-1.5">
                            $
                          </span>
                          <span className="text-[20px] font-medium text-[#0F1111] leading-none">
                            {dollars}
                          </span>
                          <span className="text-xs text-[#0F1111] relative -top-1.5">
                            {cents}
                          </span>
                        </div>

                        {/* Stock */}
                        {product.inStock ? (
                          <p className="text-xs text-[#007600] mb-3">
                            In Stock
                          </p>
                        ) : (
                          <p className="text-xs text-[#CC0C39] mb-3">
                            Out of Stock
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {product.inStock && (
                            <Button
                              onClick={() => handleAddToCart(product.id)}
                              disabled={addToCart.isPending}
                              size="sm"
                              className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium rounded-full h-8 border border-[#FCD200] shadow-none text-xs px-4"
                            >
                              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                              Add to Cart
                            </Button>
                          )}

                          {product.inStock && (
                            <Button
                              onClick={() => handleMoveToCart(product.id)}
                              disabled={
                                addToCart.isPending ||
                                removeFromWishlist.isPending
                              }
                              size="sm"
                              variant="outline"
                              className="rounded-full h-8 border-[#D5D9D9] text-[#0F1111] hover:bg-[#F0F2F2] shadow-none text-xs px-4"
                            >
                              <Package className="h-3.5 w-3.5 mr-1.5" />
                              Move to Cart
                            </Button>
                          )}

                          <button
                            onClick={() => handleRemove(product.id)}
                            disabled={removeFromWishlist.isPending}
                            className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline flex items-center gap-1 ml-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Price Column (right) */}
                      <div className="text-right shrink-0 ml-4 hidden sm:block">
                        <div className="flex items-baseline justify-end">
                          <span className="text-xs text-[#0F1111] relative -top-1.5">
                            $
                          </span>
                          <span className="text-lg font-bold text-[#0F1111] leading-none">
                            {dollars}
                          </span>
                          <span className="text-xs text-[#0F1111] relative -top-1.5">
                            {cents}
                          </span>
                        </div>
                        <p className="text-xs text-[#565959] mt-1">
                          FREE delivery
                        </p>
                      </div>
                    </div>

                    {index < wishlistItems.length - 1 && (
                      <Separator className="bg-[#E7E7E7]" />
                    )}
                  </div>
                );
              })}

              {/* Bottom actions */}
              <Separator className="bg-[#E7E7E7] mt-2" />
              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-[#565959]">
                  {wishlistItems.length}{" "}
                  {wishlistItems.length === 1 ? "item" : "items"} in your
                  Wishlist
                </p>
                <Link href="/">
                  <Button
                    variant="outline"
                    className="rounded-full h-9 border-[#D5D9D9] text-[#0F1111] hover:bg-[#F0F2F2] shadow-none text-sm"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
