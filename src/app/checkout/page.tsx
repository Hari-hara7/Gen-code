"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  ChevronRight,
  MapPin,
  CreditCard,
  Truck,
  Package,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const utils = api.useUtils();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  const { data: cart, isLoading } = api.cart.get.useQuery(undefined, {
    enabled: !!session && !orderPlaced,
  });

  const clearCart = api.cart.clear.useMutation({
    onSuccess: () => {
      void utils.cart.get.invalidate();
      void utils.cart.count.invalidate();
    },
  });

  const createOrder = api.order.create.useMutation();

  const handlePlaceOrder = async () => {
    if (!cart?.items || cart.items.length === 0) return;
    setIsPlacing(true);
    // Simulate a brief processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Save order to database first
    const taxRate = 0.08;
    const tax = cart.subtotal * taxRate;
    const orderTotal = cart.subtotal + tax;

    createOrder.mutate(
      {
        items: cart.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total: Math.round(orderTotal * 100) / 100,
      },
      {
        onSuccess: () => {
          // Clear cart after order is saved
          clearCart.mutate(undefined, {
            onSuccess: () => {
              setOrderPlaced(true);
              setIsPlacing(false);
              toast.success("Order placed successfully!", {
                description: "Thank you for your purchase.",
              });
              void utils.order.getAll.invalidate();
              void utils.order.count.invalidate();
            },
            onError: () => {
              setIsPlacing(false);
              toast.error("Failed to clear cart after order.");
            },
          });
        },
        onError: () => {
          setIsPlacing(false);
          toast.error("Failed to place order. Please try again.");
        },
      }
    );
  };

  // Not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#EAEDED]">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#0F1111] mb-2">
              Sign in to checkout
            </h1>
            <p className="text-[#565959] mb-6">
              You need to be signed in to complete your purchase.
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

  // Loading state
  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        {/* Checkout header bar */}
        <div className="border-b border-[#DDD] bg-white">
          <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-[#0F1111]"
            >
              <span className="text-[#FF9900]">a</span>mazon
              <span className="text-[#FF9900] text-xs">.clone</span>
            </Link>
            <h1 className="text-[28px] font-normal text-[#0F1111]">Checkout</h1>
            <Lock className="h-5 w-5 text-[#888]" />
          </div>
        </div>
        <div className="max-w-[1100px] mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#F0F0F0] rounded w-1/3" />
            <div className="h-40 bg-[#F0F0F0] rounded" />
            <div className="h-40 bg-[#F0F0F0] rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Order placed success
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#EAEDED]">
        {/* Checkout header bar */}
        <div className="border-b border-[#DDD] bg-white">
          <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-[#0F1111]"
            >
              <span className="text-[#FF9900]">a</span>mazon
              <span className="text-[#FF9900] text-xs">.clone</span>
            </Link>
            <h1 className="text-[28px] font-normal text-[#0F1111]">
              Order Confirmation
            </h1>
            <Lock className="h-5 w-5 text-[#888]" />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <CheckCircle2 className="h-20 w-20 text-[#067D62]" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#067D62] mb-2">
                Order placed, thank you!
              </h1>
              <p className="text-sm text-[#565959]">
                Confirmation will be sent to your email.
              </p>
            </div>

            <Separator className="bg-[#E7E7E7] mb-6" />

            {/* Order Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-[#FF9900] mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-[#0F1111] mb-0.5">
                    Estimated delivery
                  </h3>
                  <p className="text-sm text-[#0F1111]">
                    Tomorrow — FREE Shipping
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#FF9900] mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-[#0F1111] mb-0.5">
                    Shipping address
                  </h3>
                  <p className="text-sm text-[#565959]">
                    {session?.user?.name ?? "User"}
                    <br />
                    123 Demo Street
                    <br />
                    Hackathon City, HC 12345
                    <br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-[#FF9900] mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-[#0F1111] mb-0.5">
                    Payment method
                  </h3>
                  <p className="text-sm text-[#565959]">
                    Visa ending in •••• 4242 (Simulated)
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-[#E7E7E7] my-6" />

            {/* Order number */}
            <div className="bg-[#F7FAFA] border border-[#D5D9D9] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#565959]">
                Order number:{" "}
                <span className="font-bold text-[#0F1111]">
                  #AMZ-
                  {Math.random().toString(36).substring(2, 8).toUpperCase()}-
                  {Math.floor(Math.random() * 9000 + 1000)}
                </span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium rounded-full px-8 h-10 border border-[#FCD200] shadow-none w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Recommendations (decorative) */}
          <div className="bg-white rounded-lg p-6 shadow-sm mt-4">
            <h3 className="text-base font-bold text-[#0F1111] mb-2">
              Recommended for you
            </h3>
            <p className="text-sm text-[#565959]">
              Check out more deals on the{" "}
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
      </div>
    );
  }

  // Empty cart
  const isEmpty = !cart?.items || cart.items.length === 0;

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-[#EAEDED]">
        {/* Checkout header bar */}
        <div className="border-b border-[#DDD] bg-white">
          <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-[#0F1111]"
            >
              <span className="text-[#FF9900]">a</span>mazon
              <span className="text-[#FF9900] text-xs">.clone</span>
            </Link>
            <h1 className="text-[28px] font-normal text-[#0F1111]">Checkout</h1>
            <Lock className="h-5 w-5 text-[#888]" />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0F1111] mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-[#565959] mb-6">
              Add some items to your cart before checking out.
            </p>
            <Link href="/">
              <Button className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium rounded-full px-8 h-10 border border-[#FCD200] shadow-none">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Checkout Page with items
  const shippingCost: number = 0;
  const taxRate = 0.08;
  const tax = cart.subtotal * taxRate;
  const total = cart.subtotal + shippingCost + tax;

  return (
    <div className="min-h-screen bg-white">
      {/* Checkout header bar */}
      <div className="border-b border-[#DDD] bg-white">
        <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-[#0F1111]"
          >
            <span className="text-[#FF9900]">a</span>mazon
            <span className="text-[#FF9900] text-xs">.clone</span>
          </Link>
          <h1 className="text-[28px] font-normal text-[#0F1111]">
            Checkout (
            <span className="text-[#007185]">
              {cart.totalItems} {cart.totalItems === 1 ? "item" : "items"}
            </span>
            )
          </h1>
          <Lock className="h-5 w-5 text-[#888]" />
        </div>
      </div>

      {/* Checkout Progress */}
      <div className="bg-[#F7FAFA] border-b border-[#DDD]">
        <div className="max-w-[1100px] mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-[#565959]">Cart</span>
            <ChevronRight className="h-3 w-3 text-[#565959]" />
            <span className="font-bold text-[#C7511F]">Checkout</span>
            <ChevronRight className="h-3 w-3 text-[#565959]" />
            <span className="text-[#565959]">Confirmation</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Section */}
            <div className="border border-[#DDD] rounded-lg overflow-hidden">
              <div className="bg-[#F0F2F2] px-5 py-3 border-b border-[#DDD]">
                <h2 className="text-lg font-bold text-[#0F1111] flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-[#232F3E] text-white text-xs font-bold rounded-full">
                    1
                  </span>
                  Shipping address
                </h2>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#565959] mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#0F1111] mb-1">
                      {session?.user?.name ?? "User"}
                    </p>
                    <p className="text-sm text-[#565959]">
                      123 Demo Street
                      <br />
                      Hackathon City, HC 12345
                      <br />
                      India
                    </p>
                    <button className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline mt-2">
                      Change
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="border border-[#DDD] rounded-lg overflow-hidden">
              <div className="bg-[#F0F2F2] px-5 py-3 border-b border-[#DDD]">
                <h2 className="text-lg font-bold text-[#0F1111] flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-[#232F3E] text-white text-xs font-bold rounded-full">
                    2
                  </span>
                  Payment method
                </h2>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-[#565959] mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-[#232F3E] text-white text-xs font-bold px-2 py-0.5 rounded">
                        VISA
                      </div>
                      <span className="text-sm text-[#0F1111]">
                        ending in •••• 4242
                      </span>
                    </div>
                    <p className="text-xs text-[#565959] mb-2">
                      (Simulated — no real payment will be charged)
                    </p>

                    {/* Gift card / promo code */}
                    <div className="mt-3 pt-3 border-t border-[#E7E7E7]">
                      <p className="text-sm font-medium text-[#0F1111] mb-2">
                        Add a gift card or promo code
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter code"
                          className="h-[31px] border-[#a6a6a6] rounded-[3px] shadow-inner text-sm flex-1 max-w-[250px] focus-visible:ring-[#E77600] focus-visible:ring-1 focus-visible:border-[#E77600]"
                        />
                        <Button
                          variant="outline"
                          className="h-[31px] text-sm rounded-lg border-[#ADB1B8] bg-[#E7E9EC] hover:bg-[#D5D9D9] text-[#0F1111] shadow-sm px-4"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Items & Shipping Section */}
            <div className="border border-[#DDD] rounded-lg overflow-hidden">
              <div className="bg-[#F0F2F2] px-5 py-3 border-b border-[#DDD]">
                <h2 className="text-lg font-bold text-[#0F1111] flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-[#232F3E] text-white text-xs font-bold rounded-full">
                    3
                  </span>
                  Review items and shipping
                </h2>
              </div>
              <div className="p-5">
                {/* Delivery date */}
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5 text-[#067D62] shrink-0" />
                  <div>
                    <p className="text-base font-bold text-[#067D62]">
                      Delivery: Tomorrow
                    </p>
                    <p className="text-xs text-[#565959]">
                      If you order within the next 12 hours
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-[#E7E7E7] rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F7F7F7] hover:bg-[#F7F7F7]">
                        <TableHead className="text-xs font-bold text-[#565959] w-[60px]">
                          Image
                        </TableHead>
                        <TableHead className="text-xs font-bold text-[#565959]">
                          Product
                        </TableHead>
                        <TableHead className="text-xs font-bold text-[#565959] text-center w-[70px]">
                          Qty
                        </TableHead>
                        <TableHead className="text-xs font-bold text-[#565959] text-right w-[100px]">
                          Price
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-[#FAFAFA]">
                          <TableCell className="py-3">
                            <div className="w-12 h-12 bg-[#F7F7F7] rounded flex items-center justify-center overflow-hidden">
                              <Image
                                src={item.product.image}
                                alt={item.product.title}
                                width={48}
                                height={48}
                                className="object-contain"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <Link
                              href={`/product/${item.product.id}`}
                              className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline line-clamp-2"
                            >
                              {item.product.title}
                            </Link>
                            <p className="text-xs text-[#565959] mt-0.5">
                              ${item.product.price.toFixed(2)} each
                            </p>
                          </TableCell>
                          <TableCell className="py-3 text-center text-sm text-[#0F1111]">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="py-3 text-right text-sm font-bold text-[#0F1111]">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Shipping option */}
                <div className="mt-4 p-3 bg-[#F7FAFA] border border-[#D5D9D9] rounded-md">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked
                      readOnly
                      className="mt-1 accent-[#E77600]"
                    />
                    <div>
                      <p className="text-sm font-bold text-[#067D62]">
                        FREE Shipping — Get it Tomorrow
                      </p>
                      <p className="text-xs text-[#565959]">
                        FREE Shipping on orders over $25.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-[#DDD] rounded-lg p-5 sticky top-32 bg-white">
              {/* Place Order Button (top) */}
              <Button
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium rounded-full h-10 border border-[#FCD200] shadow-none text-sm mb-3"
              >
                {isPlacing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Place your order"
                )}
              </Button>

              {/* Terms */}
              <p className="text-xs text-[#565959] mb-4 leading-relaxed">
                By placing your order, you agree to Amazon.clone&apos;s{" "}
                <span className="text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
                  privacy notice
                </span>{" "}
                and{" "}
                <span className="text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
                  conditions of use
                </span>
                .
              </p>

              <Separator className="bg-[#E7E7E7] mb-4" />

              {/* Order Summary */}
              <h3 className="text-base font-bold text-[#0F1111] mb-3">
                Order Summary
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#565959]">
                    Items ({cart.totalItems}):
                  </span>
                  <span className="text-[#0F1111]">
                    ${cart.subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#565959]">Shipping & handling:</span>
                  <span className="text-[#0F1111]">$0.00</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#565959]">Estimated tax:</span>
                  <span className="text-[#0F1111]">${tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="bg-[#E7E7E7] my-3" />

              {/* Order Total */}
              <div className="flex justify-between text-lg">
                <span className="font-bold text-[#CC0C39]">Order total:</span>
                <span className="font-bold text-[#CC0C39]">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Free shipping badge */}
              <div className="mt-4 p-2 bg-[#F7FAFA] border border-[#D5D9D9] rounded text-center">
                <p className="text-xs text-[#067D62] font-medium flex items-center justify-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  FREE Shipping on this order
                </p>
              </div>

              {/* Security badge */}
              <div className="mt-3 flex items-center justify-center gap-1 text-xs text-[#565959]">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
