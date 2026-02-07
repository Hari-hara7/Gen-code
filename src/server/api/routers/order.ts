import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const orderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().int().min(1),
            price: z.number(),
          })
        ),
        total: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const order = await ctx.db.order.create({
        data: {
          userId,
          total: input.total,
          status: "completed",
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return order;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const orders = await ctx.db.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const order = await ctx.db.order.findFirst({
        where: {
          id: input.id,
          userId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      return order;
    }),

  count: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return ctx.db.order.count({
      where: { userId },
    });
  }),
});
