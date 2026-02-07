import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const cartRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    let cart = await ctx.db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart) {
      cart = await ctx.db.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const totalItems = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return {
      ...cart,
      subtotal,
      totalItems,
    };
  }),

  add: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Ensure cart exists
      let cart = await ctx.db.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        cart = await ctx.db.cart.create({
          data: { userId },
        });
      }

      // Check if item already in cart
      const existingItem = await ctx.db.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: input.productId,
          },
        },
      });

      if (existingItem) {
        // Update quantity
        return ctx.db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + input.quantity },
          include: { product: true },
        });
      }

      // Create new cart item
      return ctx.db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: input.productId,
          quantity: input.quantity,
        },
        include: { product: true },
      });
    }),

  remove: protectedProcedure
    .input(z.object({ cartItemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cartItem.delete({
        where: { id: input.cartItemId },
      });
    }),

  updateQuantity: protectedProcedure
    .input(
      z.object({
        cartItemId: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cartItem.update({
        where: { id: input.cartItemId },
        data: { quantity: input.quantity },
        include: { product: true },
      });
    }),

  clear: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const cart = await ctx.db.cart.findUnique({
      where: { userId },
    });

    if (!cart) return { success: true };

    await ctx.db.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { success: true };
  }),

  count: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const cart = await ctx.db.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) return 0;

    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }),
});
