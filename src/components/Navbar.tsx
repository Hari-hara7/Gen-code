"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingCart, Search, User, ChevronDown, MapPin, Menu, Heart } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cartCount } = api.cart.count.useQuery(undefined, {
    enabled: !!session,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main navbar */}
      <div className="flex items-center bg-[#131921] px-4 py-2 text-white">
        {/* Logo */}
        <Link
          href="/"
          className="mr-4 flex items-center border border-transparent px-2 py-1 hover:border-white rounded-sm shrink-0"
        >
          <span className="text-xl font-bold tracking-tight">
            <span className="text-[#FF9900]">a</span>mazon
          </span>
          <span className="text-[#FF9900] text-xs">.clone</span>
        </Link>

        {/* Deliver to */}
        <div className="hidden lg:flex items-center border border-transparent px-2 py-1 hover:border-white rounded-sm cursor-pointer shrink-0">
          <MapPin className="h-4 w-4 text-white mr-1" />
          <div className="flex flex-col text-xs leading-tight">
            <span className="text-[#CCCCCC]">Deliver to</span>
            <span className="font-bold text-sm">India</span>
          </div>
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex flex-1 mx-4 h-10 rounded-md overflow-hidden"
        >
          <select className="hidden sm:block bg-[#E6E6E6] text-[#555] text-xs px-2 border-r border-[#CDCDCD] outline-none cursor-pointer rounded-l-md">
            <option>All</option>
            <option>Electronics</option>
            <option>Books</option>
            <option>Clothing</option>
            <option>Home &amp; Kitchen</option>
            <option>Sports</option>
            <option>Grocery</option>
          </select>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Amazon.clone"
            className="flex-1 rounded-none border-0 bg-white text-black h-full text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
          />
          <Button
            type="submit"
            className="bg-[#FEBD69] hover:bg-[#F3A847] text-black rounded-none rounded-r-md px-3 h-full"
          >
            <Search className="h-5 w-5" />
          </Button>
        </form>

        {/* Account & Lists */}
        <div className="hidden md:flex items-center shrink-0">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col text-xs leading-tight border border-transparent px-2 py-1 hover:border-white rounded-sm">
                  <span className="text-[#CCCCCC]">
                    Hello, {session.user?.name ?? "User"}
                  </span>
                  <span className="font-bold text-sm flex items-center">
                    Account & Lists
                    <ChevronDown className="h-3 w-3 ml-0.5" />
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="font-medium text-sm">
                  {session.user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/cart")}
                  className="cursor-pointer"
                >
                  Your Cart
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/wishlist")}
                  className="cursor-pointer"
                >
                  Your Wishlist
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/orders")}
                  className="cursor-pointer"
                >
                  Your Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer text-red-600"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="flex flex-col text-xs leading-tight border border-transparent px-2 py-1 hover:border-white rounded-sm"
            >
              <span className="text-[#CCCCCC]">Hello, sign in</span>
              <span className="font-bold text-sm flex items-center">
                Account & Lists
                <ChevronDown className="h-3 w-3 ml-0.5" />
              </span>
            </Link>
          )}
        </div>

        {/* Wishlist */}
        <Link
          href="/wishlist"
          className="hidden md:flex items-center border border-transparent px-2 py-1 hover:border-white rounded-sm mx-0.5 shrink-0"
        >
          <Heart className="h-5 w-5" />
        </Link>

        {/* Returns & Orders */}
        <Link
          href="/orders"
          className="hidden md:flex flex-col text-xs leading-tight border border-transparent px-2 py-1 hover:border-white rounded-sm mx-1 shrink-0"
        >
          <span className="text-[#CCCCCC]">Returns</span>
          <span className="font-bold text-sm">& Orders</span>
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
          className="flex items-center border border-transparent px-2 py-1 hover:border-white rounded-sm shrink-0"
        >
          <div className="relative">
            <ShoppingCart className="h-7 w-7" />
            <span className="absolute -top-2 -right-1 bg-[#F08804] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {session ? (cartCount ?? 0) : 0}
            </span>
          </div>
          <span className="hidden sm:inline font-bold text-sm ml-1">Cart</span>
        </Link>
      </div>

      {/* Sub navbar */}
      <div className="flex items-center bg-[#232F3E] text-white text-sm px-4 py-1.5 gap-1 overflow-x-auto">
        <button className="flex items-center gap-1 px-2 py-1 border border-transparent hover:border-white rounded-sm whitespace-nowrap font-bold">
          <Menu className="h-4 w-4" />
          All
        </button>
        <Link
          href="/?category=Electronics"
          className="px-2 py-1 border border-transparent hover:border-white rounded-sm whitespace-nowrap"
        >
          Electronics
        </Link>
        <Link
          href="/?category=Books"
          className="px-2 py-1 border border-transparent hover:border-white rounded-sm whitespace-nowrap"
        >
          Books
        </Link>
        <Link
          href="/?category=Clothing"
          className="px-2 py-1 border border-transparent hover:border-white rounded-sm whitespace-nowrap"
        >
          Clothing
        </Link>
        <Link
          href="/?category=Home+%26+Kitchen"
          className="px-2 py-1 border border-transparent hover:border-white rounded-sm whitespace-nowrap"
        >
          Home & Kitchen
        </Link>
        <Link
          href="/?category=Sports"
          className="px-2 py-1 border border-transparent hover:border-white rounded-sm whitespace-nowrap"
        >
          Sports
        </Link>
        <Link
          href="/?category=Grocery"
          className="px-2 py-1 border border-transparent hover:border-white rounded-sm whitespace-nowrap"
        >
          Grocery
        </Link>
        <Link
          href="/orders"
          className="px-2 py-1 border border-transparent hover:border-white rounded-sm whitespace-nowrap"
        >
          Orders
        </Link>
        <Link
          href="/wishlist"
          className="px-2 py-1 border border-transparent hover:border-white rounded-sm whitespace-nowrap"
        >
          Wishlist
        </Link>
        <Link
          href="/"
          className="px-2 py-1 border border-transparent hover:border-white rounded-sm whitespace-nowrap text-[#FF9900] font-bold ml-auto"
        >
          Today&apos;s Deals
        </Link>
      </div>
    </header>
  );
}
