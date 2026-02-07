import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const productRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where = input?.category
        ? { category: input.category }
        : undefined;

      return ctx.db.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!input.query.trim()) {
        return ctx.db.product.findMany({
          orderBy: { createdAt: "desc" },
        });
      }

      const searchTerm = input.query.toLowerCase();

      const products = await ctx.db.product.findMany({
        orderBy: { createdAt: "desc" },
      });

      return products.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm)
      );
    }),

  getCategories: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    return products.map((p) => p.category);
  }),
});
