"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, Tag } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const utils = api.useUtils();

  const { data: cart, isLoading } = api.cart.get.useQuery(undefined, {
    enabled: !!session,
  });

  const updateQuantity = api.cart.updateQuantity.useMutation({
    onSuccess: () => {
      void utils.cart.get.invalidate();
      void utils.cart.count.invalidate();
      toast.success("Cart updated");
    },
  });

  const removeItem = api.cart.remove.useMutation({
    onSuccess: () => {
      void utils.cart.get.invalidate();
      void utils.cart.count.invalidate();
      toast.info("Item removed from cart");
    },
  });

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity.mutate({ cartItemId, quantity: newQuantity });
  };

  const handleRemove = (cartItemId: string) => {
    removeItem.mutate({ cartItemId });
  };

  // Redirect if not signed in
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#EAEDED]">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <ShoppingCart className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#0F1111] mb-2">
              Your Amazon.clone Cart
            </h1>
            <p className="text-[#565959] mb-6">
              Sign in to view your cart and start shopping.
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

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#EAEDED]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 bg-white rounded-lg p-6">
              <Skeleton className="h-8 w-1/3 mb-6" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-4">
                  <Skeleton className="w-[180px] h-[180px] rounded shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6">
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart?.items || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Cart Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              {/* Cart Header */}
              <div className="flex items-baseline justify-between mb-1">
                <h1 className="text-[28px] font-normal text-[#0F1111]">
                  Shopping Cart
                </h1>
                {!isEmpty && (
                  <span className="text-sm text-[#565959]">Price</span>
                )}
              </div>

              <Separator className="bg-[#E7E7E7] mb-2" />

              {isEmpty ? (
                <div className="py-12 text-center">
                  <div className="flex justify-center mb-6">
                    <ShoppingCart className="h-24 w-24 text-gray-200" />
                  </div>
                  <h2 className="text-xl font-bold text-[#0F1111] mb-2">
                    Your Amazon.clone Cart is empty
                  </h2>
                  <p className="text-sm text-[#565959] mb-6">
                    Your shopping cart is waiting. Give it purpose — fill it with
                    groceries, clothing, household supplies, electronics, and
                    more.
                  </p>
                  <Link href="/">
                    <Button className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium rounded-full px-8 h-10 border border-[#FCD200] shadow-none">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  {/* Deselect all hint */}
                  <p className="text-sm text-[#565959] mb-3 text-right">
                    <span className="text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
                      Deselect all items
                    </span>
                  </p>

                  {/* Cart Items */}
                  {cart.items.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex gap-4 py-4">
                        {/* Product Image */}
                        <Link
                          href={`/product/${item.product.id}`}
                          className="shrink-0"
                        >
                          <div className="w-[180px] h-[180px] bg-[#F7F7F7] rounded flex items-center justify-center overflow-hidden">
                            <Image
                              src={item.product.image}
                              alt={item.product.title}
                              width={180}
                              height={180}
                              className="object-contain max-h-[170px] w-auto"
                            />
                          </div>
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          {/* Title */}
                          <Link href={`/product/${item.product.id}`}>
                            <h3 className="text-lg text-[#0F1111] leading-tight hover:text-[#C7511F] line-clamp-2 mb-1">
                              {item.product.title}
                            </h3>
                          </Link>

                          {/* In Stock */}
                          {item.product.inStock ? (
                            <p className="text-xs text-[#007600] mb-1">
                              In Stock
                            </p>
                          ) : (
                            <p className="text-xs text-[#CC0C39] mb-1">
                              Out of Stock
                            </p>
                          )}

                          {/* Eligible for FREE Shipping */}
                          <p className="text-xs text-[#565959] mb-2">
                            Eligible for FREE Shipping
                          </p>

                          {/* Category badge */}
                          <span className="inline-block text-xs bg-[#F0F2F2] text-[#0F1111] border border-[#D5D9D9] rounded px-2 py-0.5 mb-3">
                            {item.product.category}
                          </span>

                          {/* Actions row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-[#D5D9D9] rounded-full overflow-hidden shadow-sm">
                              {item.quantity <= 1 ? (
                                <button
                                  onClick={() => handleRemove(item.id)}
                                  className="p-2 hover:bg-[#F0F2F2] transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="h-4 w-4 text-[#565959]" />
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  className="p-2 hover:bg-[#F0F2F2] transition-colors"
                                  disabled={updateQuantity.isPending}
                                >
                                  <Minus className="h-4 w-4 text-[#565959]" />
                                </button>
                              )}
                              <span className="px-4 py-1.5 text-sm font-medium bg-[#F0F2F2] min-w-[44px] text-center border-x border-[#D5D9D9]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                className="p-2 hover:bg-[#F0F2F2] transition-colors"
                                disabled={updateQuantity.isPending}
                              >
                                <Plus className="h-4 w-4 text-[#565959]" />
                              </button>
                            </div>

                            {/* Separator */}
                            <span className="text-[#DDD]">|</span>

                            {/* Delete */}
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline"
                              disabled={removeItem.isPending}
                            >
                              Delete
                            </button>

                            <span className="text-[#DDD]">|</span>

                            {/* Save for later (dummy) */}
                            <button className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline">
                              Save for later
                            </button>

                            <span className="text-[#DDD]">|</span>

                            {/* Share (dummy) */}
                            <button className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline">
                              Share
                            </button>
                          </div>
                        </div>

                        {/* Price Column */}
                        <div className="text-right shrink-0 ml-4">
                          <span className="text-lg font-bold text-[#0F1111]">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-xs text-[#565959] mt-0.5">
                              ${item.product.price.toFixed(2)} each
                            </p>
                          )}
                        </div>
                      </div>

                      {index < cart.items.length - 1 && (
                        <Separator className="bg-[#E7E7E7]" />
                      )}
                    </div>
                  ))}

                  {/* Subtotal at bottom of cart */}
                  <Separator className="bg-[#E7E7E7] mt-2" />
                  <div className="flex justify-end pt-4">
                    <p className="text-lg text-[#0F1111]">
                      Subtotal ({cart.totalItems}{" "}
                      {cart.totalItems === 1 ? "item" : "items"}):{" "}
                      <span className="font-bold">
                        ${cart.subtotal.toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Sidebar */}
          {!isEmpty && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-5 shadow-sm sticky top-32">
                {/* Free shipping message */}
                <div className="flex items-start gap-2 mb-3">
                  <Tag className="h-5 w-5 text-[#067D62] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#067D62]">
                    Your order qualifies for{" "}
                    <span className="font-bold">FREE Shipping</span>.
                  </p>
                </div>

                {/* Subtotal */}
                <p className="text-base text-[#0F1111] mb-4">
                  Subtotal ({cart!.totalItems}{" "}
                  {cart!.totalItems === 1 ? "item" : "items"}):{" "}
                  <span className="font-bold text-lg">
                    ${cart!.subtotal.toFixed(2)}
                  </span>
                </p>

                {/* Gift option */}
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#E77600] rounded cursor-pointer"
                  />
                  <span className="text-sm text-[#0F1111]">
                    This order contains a gift
                  </span>
                </label>

                {/* Proceed to checkout button */}
                <Button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium rounded-full h-10 border border-[#FCD200] shadow-none text-sm"
                >
                  Proceed to checkout
                </Button>
              </div>

              {/* Recently Viewed (decorative) */}
              <div className="bg-white rounded-lg p-5 shadow-sm mt-4">
                <h3 className="text-base font-bold text-[#0F1111] mb-2">
                  Your recently viewed items
                </h3>
                <p className="text-sm text-[#565959]">
                  Browse more products on the{" "}
                  <Link
                    href="/"
                    className="text-[#007185] hover:text-[#C7511F] hover:underline"
                  >
                    home page
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
