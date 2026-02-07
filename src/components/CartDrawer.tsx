"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Minus, Plus, Trash2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";

export function CartDrawer() {
  const { data: session } = useSession();
  const router = useRouter();
  const utils = api.useUtils();

  const { data: cart, isLoading } = api.cart.get.useQuery(undefined, {
    enabled: !!session,
  });

  const updateQuantity = api.cart.updateQuantity.useMutation({
    onSuccess: () => {
      void utils.cart.get.invalidate();
      void utils.cart.count.invalidate();
    },
  });

  const removeItem = api.cart.remove.useMutation({
    onSuccess: () => {
      void utils.cart.get.invalidate();
      void utils.cart.count.invalidate();
    },
  });

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity.mutate({ cartItemId, quantity: newQuantity });
  };

  const handleRemove = (cartItemId: string) => {
    removeItem.mutate({ cartItemId });
  };

  if (!session) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <button className="flex items-center border border-transparent px-2 py-1 hover:border-white rounded-sm shrink-0 text-white">
            <div className="relative">
              <ShoppingCart className="h-7 w-7" />
              <span className="absolute -top-2 -right-1 bg-[#F08804] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </div>
            <span className="hidden sm:inline font-bold text-sm ml-1">Cart</span>
          </button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md bg-white flex flex-col">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-lg font-bold text-[#0F1111]">
              Shopping Cart
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-[#0F1111] font-bold text-lg mb-2">
                Your cart is empty
              </p>
              <p className="text-sm text-[#565959] mb-4">
                Sign in to see your cart items
              </p>
              <SheetClose asChild>
                <Button
                  onClick={() => router.push("/login")}
                  className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium rounded-full px-8 border border-[#FCD200] shadow-none"
                >
                  Sign in
                </Button>
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center border border-transparent px-2 py-1 hover:border-white rounded-sm shrink-0 text-white">
          <div className="relative">
            <ShoppingCart className="h-7 w-7" />
            <span className="absolute -top-2 -right-1 bg-[#F08804] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cart?.totalItems ?? 0}
            </span>
          </div>
          <span className="hidden sm:inline font-bold text-sm ml-1">Cart</span>
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-white flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold text-[#0F1111]">
              Shopping Cart ({cart?.totalItems ?? 0})
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9900]" />
            </div>
          ) : !cart?.items || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-[#0F1111] font-bold text-lg mb-2">
                Your cart is empty
              </p>
              <p className="text-sm text-[#565959] mb-4">
                Browse products and add items to your cart
              </p>
              <SheetClose asChild>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium rounded-full px-8 border border-[#FCD200] shadow-none"
                >
                  Continue Shopping
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-0">
              {cart.items.map((item, index) => (
                <div key={item.id}>
                  <div className="flex gap-3 py-3">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-[#F7F7F7] rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
                      <Image
                        src={item.product.image}
                        alt={item.product.title}
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm text-[#0F1111] line-clamp-2 leading-tight mb-1">
                        {item.product.title}
                      </h4>

                      {/* Price */}
                      <div className="flex items-baseline mb-1.5">
                        <span className="text-xs relative -top-1">$</span>
                        <span className="text-base font-bold text-[#0F1111]">
                          {Math.floor(item.product.price)}
                        </span>
                        <span className="text-xs relative -top-1">
                          {Math.round((item.product.price - Math.floor(item.product.price)) * 100)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                      </div>

                      {item.product.inStock ? (
                        <span className="text-xs text-[#007600]">In Stock</span>
                      ) : (
                        <span className="text-xs text-[#CC0C39]">Out of Stock</span>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-[#D5D9D9] rounded-lg overflow-hidden shadow-sm">
                          {item.quantity <= 1 ? (
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="p-1.5 hover:bg-[#F0F2F2] transition-colors"
                              title="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-[#565959]" />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              className="p-1.5 hover:bg-[#F0F2F2] transition-colors"
                              disabled={updateQuantity.isPending}
                            >
                              <Minus className="h-3.5 w-3.5 text-[#565959]" />
                            </button>
                          )}

                          <span className="px-3 py-1 text-sm font-medium bg-[#F0F2F2] min-w-[36px] text-center border-x border-[#D5D9D9]">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className="p-1.5 hover:bg-[#F0F2F2] transition-colors"
                            disabled={updateQuantity.isPending}
                          >
                            <Plus className="h-3.5 w-3.5 text-[#565959]" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline ml-1"
                          disabled={removeItem.isPending}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Item Subtotal */}
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-[#0F1111]">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {index < cart.items.length - 1 && <Separator className="bg-[#DDD]" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Subtotal & Checkout */}
        {cart?.items && cart.items.length > 0 && (
          <div className="border-t bg-white px-4 py-3 space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#0F1111]">
                Subtotal ({cart.totalItems} {cart.totalItems === 1 ? "item" : "items"}):
              </span>
              <span className="text-lg font-bold text-[#0F1111]">
                ${cart.subtotal.toFixed(2)}
              </span>
            </div>

            {/* Checkout Button */}
            <SheetClose asChild>
              <Button
                onClick={() => router.push("/checkout")}
                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium rounded-full h-10 border border-[#FCD200] shadow-none"
              >
                Proceed to Checkout
              </Button>
            </SheetClose>

            {/* View Cart Button */}
            <SheetClose asChild>
              <Button
                variant="outline"
                onClick={() => router.push("/cart")}
                className="w-full rounded-full h-10 border-[#D5D9D9] text-[#0F1111] hover:bg-[#F0F2F2] shadow-none"
              >
                View Cart
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
