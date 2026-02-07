"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "~/components/ProductCard";
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

function ProductGrid() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";

  const { data: searchResults, isLoading: searchLoading } =
    api.product.search.useQuery(
      { query: searchQuery },
      { enabled: !!searchQuery },
    );

  const { data: allProducts, isLoading: allLoading } =
    api.product.getAll.useQuery(category ? { category } : undefined, {
      enabled: !searchQuery,
    });

  const products = searchQuery ? searchResults : allProducts;
  const isLoading = searchQuery ? searchLoading : allLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
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
          </p>
        )}
      </div>

      {/* Separator line */}
      <div className="border-b border-[#DDD] mb-4" />

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-md border border-[#DDD] animate-pulse"
            >
              <div className="h-[260px] bg-[#F0F0F0]" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-[#F0F0F0] rounded w-full" />
                <div className="h-3 bg-[#F0F0F0] rounded w-2/3" />
                <div className="h-3 bg-[#F0F0F0] rounded w-1/3" />
                <div className="h-6 bg-[#F0F0F0] rounded w-1/2" />
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
              : "No products found in this category."}
          </p>
          <a
            href="/"
            className="mt-4 text-sm text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            Back to all products
          </a>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-md border border-[#DDD] animate-pulse"
                >
                  <div className="h-[260px] bg-[#F0F0F0]" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-[#F0F0F0] rounded w-full" />
                    <div className="h-3 bg-[#F0F0F0] rounded w-2/3" />
                    <div className="h-6 bg-[#F0F0F0] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <ProductGrid />
      </Suspense>

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
                  <a href="#" className="hover:underline">
                    Your Orders
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Returns & Replacements
                  </a>
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
