import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const recentlyViewedRouter = createTRPCRouter({
  track: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Upsert — update viewedAt if already exists, otherwise create
      await ctx.db.recentlyViewed.upsert({
        where: {
          userId_productId: {
            userId,
            productId: input.productId,
          },
        },
        update: {
          viewedAt: new Date(),
        },
        create: {
          userId,
          productId: input.productId,
        },
      });

      // Keep only the latest 10 viewed items for this user
      const allViewed = await ctx.db.recentlyViewed.findMany({
        where: { userId },
        orderBy: { viewedAt: "desc" },
        select: { id: true },
      });

      if (allViewed.length > 10) {
        const idsToDelete = allViewed.slice(10).map((v) => v.id);
        await ctx.db.recentlyViewed.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      return { success: true };
    }),

  getRecent: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(20).default(5),
          excludeProductId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const limit = input?.limit ?? 5;
      const excludeProductId = input?.excludeProductId;

      const where: Record<string, unknown> = { userId };
      if (excludeProductId) {
        where.productId = { not: excludeProductId };
      }

      const items = await ctx.db.recentlyViewed.findMany({
        where,
        include: {
          product: true,
        },
        orderBy: { viewedAt: "desc" },
        take: limit,
      });

      return items;
    }),
});
