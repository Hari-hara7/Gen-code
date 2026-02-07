import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const ratingRouter = createTRPCRouter({
  rate: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        value: z.number().int().min(1).max(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Upsert the user's rating
      const rating = await ctx.db.rating.upsert({
        where: {
          userId_productId: {
            userId,
            productId: input.productId,
          },
        },
        update: {
          value: input.value,
        },
        create: {
          userId,
          productId: input.productId,
          value: input.value,
        },
      });

      // Recalculate average rating for this product
      const aggregate = await ctx.db.rating.aggregate({
        where: { productId: input.productId },
        _avg: { value: true },
        _count: { value: true },
      });

      const avgRating = aggregate._avg.value ?? input.value;
      const reviewCount = aggregate._count.value ?? 1;

      // Update the product's rating and reviewCount
      await ctx.db.product.update({
        where: { id: input.productId },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount,
        },
      });

      return {
        rating,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount,
      };
    }),

  getUserRating: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const rating = await ctx.db.rating.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: input.productId,
          },
        },
      });

      return rating?.value ?? null;
    }),

  getProductRating: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const aggregate = await ctx.db.rating.aggregate({
        where: { productId: input.productId },
        _avg: { value: true },
        _count: { value: true },
      });

      return {
        averageRating: aggregate._avg.value
          ? Math.round(aggregate._avg.value * 10) / 10
          : null,
        reviewCount: aggregate._count.value ?? 0,
      };
    }),
});
