"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className="h-4 w-4 fill-[#FFA41C] text-[#FFA41C]"
          />
        ))}
        {hasHalf && (
          <div className="relative h-4 w-4">
            <Star className="absolute h-4 w-4 text-[#FFA41C]" />
            <div className="absolute overflow-hidden w-[50%]">
              <Star className="h-4 w-4 fill-[#FFA41C] text-[#FFA41C]" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="h-4 w-4 text-[#FFA41C]"
          />
        ))}
      </div>
      <span className="text-sm text-[#007185] hover:text-[#C7511F] cursor-pointer">
        {reviewCount.toLocaleString()}
      </span>
    </div>
  );
}

function WishlistButton({ productId, title }: { productId: string; title: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const utils = api.useUtils();

  const { data: isInWishlist } = api.wishlist.isInWishlist.useQuery(
    { productId },
    { enabled: !!session }
  );

  const toggleWishlist = api.wishlist.toggle.useMutation({
    onSuccess: (data) => {
      void utils.wishlist.isInWishlist.invalidate({ productId });
      void utils.wishlist.get.invalidate();
      void utils.wishlist.count.invalidate();
      if (data.added) {
        toast.success("Added to Wishlist", {
          description: title,
        });
      } else {
        toast.info("Removed from Wishlist", {
          description: title,
        });
      }
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push("/login");
      return;
    }
    toggleWishlist.mutate({ productId });
  };

  return (
    <button
      onClick={handleClick}
      disabled={toggleWishlist.isPending}
      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm border border-[#DDD] transition-all hover:scale-110"
      title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          isInWishlist
            ? "fill-[#CC0C39] text-[#CC0C39]"
            : "text-[#565959] hover:text-[#CC0C39]"
        }`}
      />
    </button>
  );
}

export function ProductCard({
  id,
  title,
  description,
  price,
  image,
  category,
  rating,
  reviewCount,
  inStock,
}: ProductCardProps) {
  const dollars = Math.floor(price);
  const cents = Math.round((price - dollars) * 100)
    .toString()
    .padStart(2, "0");

  return (
    <Link href={`/product/${id}`}>
      <Card className="group h-full border border-[#DDD] rounded-md shadow-none hover:shadow-md transition-shadow duration-200 overflow-hidden bg-white py-0 gap-0">
        {/* Image container */}
        <div className="relative bg-[#F7F7F7] flex items-center justify-center p-4 h-[260px] overflow-hidden">
          <Image
            src={image}
            alt={title}
            width={220}
            height={220}
            className="object-contain max-h-[230px] w-auto group-hover:scale-105 transition-transform duration-200"
          />
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 bg-white/90 text-[#555] text-xs font-normal border-0"
          >
            {category}
          </Badge>
          <WishlistButton productId={id} title={title} />
        </div>

        {/* Content */}
        <CardContent className="p-3 pt-3 flex flex-col gap-1.5">
          {/* Title */}
          <h3 className="text-sm font-normal text-[#0F1111] leading-tight line-clamp-2 group-hover:text-[#C7511F] transition-colors">
            {title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-[#565959] line-clamp-1">{description}</p>

          {/* Rating */}
          <RatingStars rating={rating} reviewCount={reviewCount} />

          {/* Price */}
          <div className="flex items-baseline mt-0.5">
            <span className="text-xs text-[#0F1111] relative -top-1.5">$</span>
            <span className="text-[22px] font-medium text-[#0F1111] leading-none">
              {dollars}
            </span>
            <span className="text-xs text-[#0F1111] relative -top-1.5">
              {cents}
            </span>
          </div>

          {/* Delivery info */}
          <p className="text-xs text-[#565959]">
            FREE delivery <span className="font-bold text-[#0F1111]">Tomorrow</span>
          </p>

          {/* Stock status */}
          {inStock ? (
            <span className="text-xs text-[#007600] font-medium">In Stock</span>
          ) : (
            <span className="text-xs text-[#CC0C39] font-medium">Out of Stock</span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
