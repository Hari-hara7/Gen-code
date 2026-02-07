import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const productRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          sortBy: z
            .enum(["price_asc", "price_desc", "rating_desc", "newest", "reviews"])
            .optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};

      if (input?.category) {
        where.category = input.category;
      }

      if (input?.minPrice !== undefined || input?.maxPrice !== undefined) {
        where.price = {};
        if (input?.minPrice !== undefined) {
          (where.price as Record<string, unknown>).gte = input.minPrice;
        }
        if (input?.maxPrice !== undefined) {
          (where.price as Record<string, unknown>).lte = input.maxPrice;
        }
      }

      let orderBy: Record<string, string> = { createdAt: "desc" };
      if (input?.sortBy === "price_asc") {
        orderBy = { price: "asc" };
      } else if (input?.sortBy === "price_desc") {
        orderBy = { price: "desc" };
      } else if (input?.sortBy === "rating_desc") {
        orderBy = { rating: "desc" };
      } else if (input?.sortBy === "reviews") {
        orderBy = { reviewCount: "desc" };
      } else if (input?.sortBy === "newest") {
        orderBy = { createdAt: "desc" };
      }

      return ctx.db.product.findMany({
        where,
        orderBy,
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
    .input(
      z.object({
        query: z.string(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        category: z.string().optional(),
        sortBy: z
          .enum(["price_asc", "price_desc", "rating_desc", "newest", "reviews"])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Fetch all products first, then filter in-memory (SQLite doesn't support full-text well)
      const allProducts = await ctx.db.product.findMany();

      let filtered = allProducts;

      // Text search
      if (input.query.trim()) {
        const searchTerm = input.query.toLowerCase();
        filtered = filtered.filter(
          (product) =>
            product.title.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
      }

      // Category filter
      if (input.category) {
        filtered = filtered.filter(
          (product) => product.category === input.category
        );
      }

      // Price range filter
      if (input.minPrice !== undefined) {
        filtered = filtered.filter(
          (product) => product.price >= input.minPrice!
        );
      }
      if (input.maxPrice !== undefined) {
        filtered = filtered.filter(
          (product) => product.price <= input.maxPrice!
        );
      }

      // Sort
      if (input.sortBy === "price_asc") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (input.sortBy === "price_desc") {
        filtered.sort((a, b) => b.price - a.price);
      } else if (input.sortBy === "rating_desc") {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (input.sortBy === "reviews") {
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
      } else {
        filtered.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
      }

      return filtered;
    }),

  getCategories: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    return products.map((p) => p.category);
  }),

  getPriceRange: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      select: { price: true },
      orderBy: { price: "asc" },
    });

    if (products.length === 0) {
      return { min: 0, max: 1000 };
    }

    return {
      min: Math.floor(products[0]!.price),
      max: Math.ceil(products[products.length - 1]!.price),
    };
  }),
});
