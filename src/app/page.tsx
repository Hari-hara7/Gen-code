"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { ProductCard } from "~/components/ProductCard";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";

function HeroBanner() {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] bg-gradient-to-b from-[#232F3E] to-[#EAEDED] overflow-hidden">
      {/* Hero gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#EAEDED]" />

      {/* Hero content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8 md:pt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Deal cards */}
          {[
            {
              title: "Shop deals in Electronics",
              image: "https://picsum.photos/seed/deal1/300/200",
              link: "Electronics",
            },
            {
              title: "New arrivals in Clothing",
              image: "https://picsum.photos/seed/deal2/300/200",
              link: "Clothing",
            },
            {
              title: "Best sellers in Books",
              image: "https://picsum.photos/seed/deal3/300/200",
              link: "Books",
            },
            {
              title: "Explore Home & Kitchen",
              image: "https://picsum.photos/seed/deal4/300/200",
              link: "Home & Kitchen",
            },
          ].map((deal, i) => (
            <a
              key={i}
              href={`/?category=${encodeURIComponent(deal.link)}`}
              className="bg-white p-4 rounded-sm shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-base font-bold text-[#0F1111] mb-2">
                {deal.title}
              </h3>
              <div className="w-full h-[140px] bg-[#F7F7F7] rounded overflow-hidden mb-2">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline">
                Shop now
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

type SortOption = "newest" | "price_asc" | "price_desc" | "rating_desc" | "reviews";

function FilterBar({
  category,
  sortBy,
  minPrice,
  maxPrice,
  onCategoryChange,
  onSortChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClearFilters,
  hasActiveFilters,
}: {
  category: string;
  sortBy: SortOption;
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (val: string) => void;
  onSortChange: (val: SortOption) => void;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}) {
  const { data: categories } = api.product.getCategories.useQuery();
  const { data: priceRange } = api.product.getPriceRange.useQuery();

  return (
    <div className="bg-white border border-[#DDD] rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="h-4 w-4 text-[#565959]" />
        <span className="text-sm font-bold text-[#0F1111]">
          Filter & Sort
        </span>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="ml-auto flex items-center gap-1 text-xs text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            <X className="h-3 w-3" />
            Clear all filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* Category Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#565959] font-medium">Category</label>
          <Select value={category || "all"} onValueChange={(val) => onCategoryChange(val === "all" ? "" : val)}>
            <SelectTrigger className="w-[160px] h-8 text-xs border-[#D5D9D9] rounded-lg bg-[#F0F2F2] hover:bg-[#E3E6E6] shadow-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#565959] font-medium">Price Range</label>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#565959]">$</span>
              <input
                type="number"
                placeholder={priceRange ? String(priceRange.min) : "Min"}
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="w-[80px] h-8 text-xs pl-5 pr-2 border border-[#D5D9D9] rounded-lg bg-[#F0F2F2] hover:bg-[#E3E6E6] shadow-sm outline-none focus:ring-1 focus:ring-[#E77600] focus:border-[#E77600]"
                min={0}
              />
            </div>
            <span className="text-xs text-[#565959]">to</span>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#565959]">$</span>
              <input
                type="number"
                placeholder={priceRange ? String(priceRange.max) : "Max"}
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="w-[80px] h-8 text-xs pl-5 pr-2 border border-[#D5D9D9] rounded-lg bg-[#F0F2F2] hover:bg-[#E3E6E6] shadow-sm outline-none focus:ring-1 focus:ring-[#E77600] focus:border-[#E77600]"
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Sort By */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#565959] font-medium">Sort By</label>
          <Select value={sortBy} onValueChange={(val) => onSortChange(val as SortOption)}>
            <SelectTrigger className="w-[180px] h-8 text-xs border-[#D5D9D9] rounded-lg bg-[#F0F2F2] hover:bg-[#E3E6E6] shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest Arrivals</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating_desc">Avg. Customer Review</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick price filters */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#565959] font-medium">Quick Price</label>
          <div className="flex gap-1.5">
            {[
              { label: "Under $25", min: "", max: "25" },
              { label: "$25-$50", min: "25", max: "50" },
              { label: "$50-$100", min: "50", max: "100" },
              { label: "$100+", min: "100", max: "" },
            ].map((range) => {
              const isActive = minPrice === range.min && maxPrice === range.max;
              return (
                <button
                  key={range.label}
                  onClick={() => {
                    if (isActive) {
                      onMinPriceChange("");
                      onMaxPriceChange("");
                    } else {
                      onMinPriceChange(range.min);
                      onMaxPriceChange(range.max);
                    }
                  }}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    isActive
                      ? "bg-[#232F3E] text-white border-[#232F3E]"
                      : "bg-white text-[#0F1111] border-[#D5D9D9] hover:bg-[#F0F2F2]"
                  }`}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentlyViewedSection() {
  const { data: session } = useSession();

  const { data: recentItems } = api.recentlyViewed.getRecent.useQuery(
    { limit: 6 },
    { enabled: !!session }
  );

  if (!session || !recentItems || recentItems.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg p-5 shadow-sm">
        <h3 className="text-lg font-bold text-[#0F1111] mb-4">
          Your recently viewed items
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {recentItems.map((item) => {
            const product = item.product;
            const dollars = Math.floor(product.price);
            const cents = Math.round((product.price - dollars) * 100)
              .toString()
              .padStart(2, "0");

            return (
              <Link
                key={item.id}
                href={`/product/${product.id}`}
                className="shrink-0 group"
              >
                <div className="w-[170px] bg-white border border-[#DDD] rounded-md overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-[150px] bg-[#F7F7F7] flex items-center justify-center p-3">
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={130}
                      height={130}
                      className="object-contain max-h-[130px] w-auto"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs text-[#0F1111] line-clamp-2 leading-tight group-hover:text-[#C7511F] transition-colors mb-1">
                      {product.title}
                    </p>
                    <div className="flex items-baseline">
                      <span className="text-[10px] text-[#0F1111] relative -top-1">
                        $
                      </span>
                      <span className="text-sm font-medium text-[#0F1111]">
                        {dollars}
                      </span>
                      <span className="text-[10px] text-[#0F1111] relative -top-1">
                        {cents}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProductGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL-driven state
  const searchQuery = searchParams.get("search") ?? "";
  const urlCategory = searchParams.get("category") ?? "";

  // Local filter state
  const [localCategory, setLocalCategory] = useState(urlCategory);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Sync category from URL
  const category = urlCategory || localCategory;

  const hasActiveFilters =
    !!category || !!minPrice || !!maxPrice || sortBy !== "newest";

  const clearFilters = useCallback(() => {
    setLocalCategory("");
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
    if (urlCategory || searchQuery) {
      router.push("/");
    }
  }, [urlCategory, searchQuery, router]);

  const handleCategoryChange = useCallback(
    (val: string) => {
      setLocalCategory(val);
      if (val) {
        router.push(`/?category=${encodeURIComponent(val)}`);
      } else if (urlCategory) {
        router.push("/");
      }
    },
    [router, urlCategory]
  );

  // Build query parameters
  const minPriceNum = minPrice ? parseFloat(minPrice) : undefined;
  const maxPriceNum = maxPrice ? parseFloat(maxPrice) : undefined;

  const { data: searchResults, isLoading: searchLoading } =
    api.product.search.useQuery(
      {
        query: searchQuery,
        category: category || undefined,
        minPrice: minPriceNum,
        maxPrice: maxPriceNum,
        sortBy,
      },
      { enabled: !!searchQuery }
    );

  const { data: allProducts, isLoading: allLoading } =
    api.product.getAll.useQuery(
      {
        category: category || undefined,
        minPrice: minPriceNum,
        maxPrice: maxPriceNum,
        sortBy,
      },
      { enabled: !searchQuery }
    );

  const products = searchQuery ? searchResults : allProducts;
  const isLoading = searchQuery ? searchLoading : allLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Filter Bar */}
      <FilterBar
        category={category}
        sortBy={sortBy}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onCategoryChange={handleCategoryChange}
        onSortChange={setSortBy}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Results header */}
      <div className="mb-4">
        {searchQuery ? (
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-bold text-[#0F1111]">Results</h2>
            <span className="text-sm text-[#565959]">
              for &ldquo;{searchQuery}&rdquo;
            </span>
          </div>
        ) : category ? (
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-bold text-[#0F1111]">{category}</h2>
            <a
              href="/"
              className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline"
            >
              Clear filter
            </a>
          </div>
        ) : (
          <h2 className="text-xl font-bold text-[#0F1111]">Trending deals</h2>
        )}

        {!isLoading && products && (
          <p className="text-sm text-[#565959] mt-1">
            {products.length} {products.length === 1 ? "result" : "results"}
            {sortBy !== "newest" && (
              <span>
                {" · Sorted by "}
                {sortBy === "price_asc"
                  ? "Price: Low to High"
                  : sortBy === "price_desc"
                    ? "Price: High to Low"
                    : sortBy === "rating_desc"
                      ? "Avg. Customer Review"
                      : sortBy === "reviews"
                        ? "Most Reviews"
                        : "Newest"}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Separator line */}
      <div className="border-b border-[#DDD] mb-4" />

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-md border border-[#DDD]">
              <Skeleton className="h-[260px] w-full rounded-t-md rounded-b-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              description={product.description}
              price={product.price}
              image={product.image}
              category={product.category}
              rating={product.rating}
              reviewCount={product.reviewCount}
              inStock={product.inStock}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-[#0F1111] mb-2">
            No results found
          </h3>
          <p className="text-sm text-[#565959] text-center max-w-md">
            {searchQuery
              ? `We couldn't find any products matching "${searchQuery}". Try a different search term.`
              : "No products found matching your filters."}
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 text-sm text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <HeroBanner />

      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Filter bar skeleton */}
            <div className="bg-white border border-[#DDD] rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-8 w-[160px]" />
                <Skeleton className="h-8 w-[180px]" />
                <Skeleton className="h-8 w-[180px]" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-md border border-[#DDD]"
                >
                  <Skeleton className="h-[260px] w-full rounded-t-md rounded-b-none" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <ProductGrid />
      </Suspense>

      {/* Recently Viewed Section */}
      <RecentlyViewedSection />

      {/* Footer */}
      <footer className="mt-12">
        <div className="bg-[#37475A] text-white text-center py-3">
          <a href="#" className="text-sm hover:underline">
            Back to top
          </a>
        </div>
        <div className="bg-[#232F3E] text-white py-10">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-base mb-3">Get to Know Us</h4>
              <ul className="space-y-2 text-sm text-[#DDD]">
                <li>
                  <a href="#" className="hover:underline">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    About Amazon.clone
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base mb-3">Make Money with Us</h4>
              <ul className="space-y-2 text-sm text-[#DDD]">
                <li>
                  <a href="#" className="hover:underline">
                    Sell products
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Become an Affiliate
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Advertise
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base mb-3">Payment Products</h4>
              <ul className="space-y-2 text-sm text-[#DDD]">
                <li>
                  <a href="#" className="hover:underline">
                    Business Card
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Shop with Points
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Reload Your Balance
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base mb-3">Let Us Help You</h4>
              <ul className="space-y-2 text-sm text-[#DDD]">
                <li>
                  <a href="#" className="hover:underline">
                    Your Account
                  </a>
                </li>
                <li>
                  <Link href="/orders" className="hover:underline">
                    Your Orders
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Returns & Replacements
                  </a>
                </li>
                <li>
                  <Link href="/wishlist" className="hover:underline">
                    Your Wishlist
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Help
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-[#131A22] text-white text-center py-4">
          <p className="text-xs text-[#999]">
            &copy; 2024 Amazon.clone — T3 Stack Hackathon Project. Not
            affiliated with Amazon.
          </p>
        </div>
      </footer>
    </div>
  );
}
