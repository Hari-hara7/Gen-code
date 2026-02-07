import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const wishlistRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const items = await ctx.db.wishlistItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return items;
  }),

  add: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.db.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: input.productId,
          },
        },
      });

      if (existing) {
        return existing;
      }

      return ctx.db.wishlistItem.create({
        data: {
          userId,
          productId: input.productId,
        },
        include: { product: true },
      });
    }),

  remove: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return ctx.db.wishlistItem.delete({
        where: {
          userId_productId: {
            userId,
            productId: input.productId,
          },
        },
      });
    }),

  toggle: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.db.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: input.productId,
          },
        },
      });

      if (existing) {
        await ctx.db.wishlistItem.delete({
          where: { id: existing.id },
        });
        return { added: false };
      }

      await ctx.db.wishlistItem.create({
        data: {
          userId,
          productId: input.productId,
        },
      });

      return { added: true };
    }),

  isInWishlist: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const item = await ctx.db.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: input.productId,
          },
        },
      });

      return !!item;
    }),

  count: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return ctx.db.wishlistItem.count({
      where: { userId },
    });
  }),
});
