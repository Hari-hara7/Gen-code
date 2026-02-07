"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Package, ChevronRight, Calendar, CreditCard, Truck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

function OrderSkeleton() {
  return (
    <Card className="border border-[#DDD] shadow-none">
      <div className="bg-[#F0F2F2] px-5 py-3 border-b border-[#DDD] rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex gap-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <CardContent className="p-5">
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-[90px] h-[90px] rounded shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: orders, isLoading } = api.order.getAll.useQuery(undefined, {
    enabled: !!session,
  });

  // Not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#EAEDED]">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#0F1111] mb-2">
              Your Orders
            </h1>
            <p className="text-[#565959] mb-6">
              Sign in to view your order history.
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
          {/* Breadcrumb skeleton */}
          <Skeleton className="h-5 w-64 mb-4" />
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !orders || orders.length === 0;

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-[#565959] mb-4">
          <Link
            href="/"
            className="text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#0F1111]">Your Orders</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[28px] font-normal text-[#0F1111]">
            Your Orders
          </h1>
          {!isEmpty && (
            <span className="text-sm text-[#565959]">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          )}
        </div>

        {/* Empty State */}
        {isEmpty ? (
          <div className="bg-white rounded-lg p-12 shadow-sm text-center">
            <div className="flex justify-center mb-6">
              <Package className="h-24 w-24 text-gray-200" />
            </div>
            <h2 className="text-xl font-bold text-[#0F1111] mb-2">
              You haven&apos;t placed any orders yet
            </h2>
            <p className="text-sm text-[#565959] mb-6 max-w-md mx-auto">
              Once you place an order, it will appear here so you can track and
              manage your purchases.
            </p>
            <Link href="/">
              <Button className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium rounded-full px-8 h-10 border border-[#FCD200] shadow-none">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderDate = new Date(order.createdAt);
              const formattedDate = orderDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              const orderId = order.id.slice(-8).toUpperCase();

              return (
                <Card
                  key={order.id}
                  className="border border-[#DDD] shadow-none rounded-lg overflow-hidden py-0 gap-0"
                >
                  {/* Order Header */}
                  <div className="bg-[#F0F2F2] px-5 py-3 border-b border-[#DDD]">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#565959]">
                        <div>
                          <span className="uppercase font-medium block">
                            Order Placed
                          </span>
                          <span className="text-[#0F1111] text-sm">
                            {formattedDate}
                          </span>
                        </div>
                        <div>
                          <span className="uppercase font-medium block">
                            Total
                          </span>
                          <span className="text-[#0F1111] text-sm font-bold">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="uppercase font-medium block">
                            Ship To
                          </span>
                          <span className="text-[#007185] text-sm hover:text-[#C7511F] hover:underline cursor-pointer">
                            {session?.user?.name ?? "User"}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-[#565959] sm:text-right">
                        <span className="uppercase font-medium block">
                          Order # {orderId}
                        </span>
                        <Badge
                          variant="secondary"
                          className="mt-1 bg-[#067D62]/10 text-[#067D62] border-0 text-xs font-medium"
                        >
                          {order.status === "completed"
                            ? "Delivered"
                            : order.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <CardContent className="p-5">
                    {/* Delivery status line */}
                    <div className="flex items-center gap-2 mb-4">
                      <Truck className="h-5 w-5 text-[#067D62] shrink-0" />
                      <p className="text-base font-bold text-[#067D62]">
                        Delivered {formattedDate}
                      </p>
                    </div>

                    {/* Items */}
                    <div className="space-y-0">
                      {order.items.map((item, itemIndex) => (
                        <div key={item.id}>
                          <div className="flex gap-4 py-3">
                            {/* Product Image */}
                            <Link
                              href={`/product/${item.product.id}`}
                              className="shrink-0"
                            >
                              <div className="w-[90px] h-[90px] bg-[#F7F7F7] rounded flex items-center justify-center overflow-hidden">
                                <Image
                                  src={item.product.image}
                                  alt={item.product.title}
                                  width={90}
                                  height={90}
                                  className="object-contain max-h-[80px] w-auto"
                                />
                              </div>
                            </Link>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <Link href={`/product/${item.product.id}`}>
                                <h3 className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline line-clamp-2 mb-1">
                                  {item.product.title}
                                </h3>
                              </Link>
                              <p className="text-xs text-[#565959] mb-1">
                                Qty: {item.quantity} &middot; $
                                {item.price.toFixed(2)} each
                              </p>
                              <p className="text-sm font-bold text-[#0F1111]">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>

                              {/* Action buttons */}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Link href={`/product/${item.product.id}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full h-7 border-[#D5D9D9] text-[#0F1111] hover:bg-[#F0F2F2] shadow-none text-xs px-3"
                                  >
                                    Buy it again
                                  </Button>
                                </Link>
                                <Link href={`/product/${item.product.id}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full h-7 border-[#D5D9D9] text-[#0F1111] hover:bg-[#F0F2F2] shadow-none text-xs px-3"
                                  >
                                    View product
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>

                          {itemIndex < order.items.length - 1 && (
                            <Separator className="bg-[#E7E7E7]" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Order summary footer */}
                    <Separator className="bg-[#E7E7E7] mt-2" />
                    <div className="flex items-center justify-between pt-3">
                      <div className="flex items-center gap-4 text-xs text-[#565959]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formattedDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5" />
                          Visa ••4242
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-3.5 w-3.5" />
                          {order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}{" "}
                          {order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          ) === 1
                            ? "item"
                            : "items"}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#0F1111]">
                        Order Total: ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer hint */}
        {!isEmpty && (
          <div className="mt-6 text-center">
            <p className="text-sm text-[#565959]">
              Need help with an order?{" "}
              <span className="text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
                Contact Customer Service
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
