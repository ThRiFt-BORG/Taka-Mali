import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { collections } from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

/**
 * Validation schemas for collection data
 */
const createCollectionSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  wasteType: z.enum(["Organic", "Inorganic", "Mixed"]),
  collectionDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date"),
  totalVolume: z.number().positive("Total volume must be greater than 0"),
  wasteSeparated: z.boolean(),
  organicVolume: z.number().optional(),
  inorganicVolume: z.number().optional(),
  collectionCount: z.number().int().min(1, "Collection count must be at least 1"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const filterSchema = z.object({
  siteName: z.string().optional(),
  wasteType: z.enum(["Organic", "Inorganic", "Mixed"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const collectionsRouter = router({
  /**
   * Submit a new collection record (Collector only)
   */
  submit: protectedProcedure
    .input(createCollectionSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "collector" && ctx.user?.role !== "admin") {
        throw new Error("Only collectors can submit data");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Validate volume constraints
      if (input.wasteSeparated) {
        const organic = input.organicVolume || 0;
        const inorganic = input.inorganicVolume || 0;
        if (organic + inorganic > input.totalVolume) {
          throw new Error("Separated volumes cannot exceed total volume");
        }
      }

      try {
        const result = await db.insert(collections).values({
          collectorId: ctx.user.id,
          siteName: input.siteName,
          wasteType: input.wasteType,
          collectionDate: new Date(input.collectionDate),
          totalVolume: input.totalVolume.toString(),
          wasteSeparated: input.wasteSeparated,
          organicVolume: input.organicVolume?.toString(),
          inorganicVolume: input.inorganicVolume?.toString(),
          collectionCount: input.collectionCount,
          latitude: input.latitude.toString(),
          longitude: input.longitude.toString(),
        });

        return { success: true, message: "Collection submitted successfully" };
      } catch (error) {
        console.error("Failed to submit collection:", error);
        throw new Error("Failed to submit collection");
      }
    }),

  /**
   * Get collector's own records
   */
  myRecords: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "collector" && ctx.user?.role !== "admin") {
      throw new Error("Only collectors can view records");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      const result = await db
        .select()
        .from(collections)
        .where(eq(collections.collectorId, ctx.user.id));

      return result;
    } catch (error) {
      console.error("Failed to fetch records:", error);
      throw new Error("Failed to fetch records");
    }
  }),

  /**
   * Get filtered collections (Public - no auth required)
   */
  filtered: publicProcedure
    .input(filterSchema)
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        const conditions = [];

        if (input.siteName) {
          conditions.push(eq(collections.siteName, input.siteName));
        }

        if (input.wasteType) {
          conditions.push(eq(collections.wasteType, input.wasteType));
        }

        if (input.startDate) {
          conditions.push(gte(collections.collectionDate, new Date(input.startDate)));
        }

        if (input.endDate) {
          conditions.push(lte(collections.collectionDate, new Date(input.endDate)));
        }

        let result;
        if (conditions.length > 0) {
          result = await db.select().from(collections).where(and(...conditions));
        } else {
          result = await db.select().from(collections);
        }

        return result;
      } catch (error) {
        console.error("Failed to fetch filtered collections:", error);
        throw new Error("Failed to fetch filtered collections");
      }
    }),

  /**
   * Get aggregated summary statistics (Public)
   */
  summary: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      const result = await db.select().from(collections);

      const summary = {
        totalRecords: result.length,
        totalVolume: result.reduce((sum, r) => sum + parseFloat(r.totalVolume as any), 0),
        byWasteType: {
          Organic: result.filter((r) => r.wasteType === "Organic").length,
          Inorganic: result.filter((r) => r.wasteType === "Inorganic").length,
          Mixed: result.filter((r) => r.wasteType === "Mixed").length,
        },
        bySite: {} as Record<string, number>,
      };

      // Count by site
      result.forEach((r) => {
        summary.bySite[r.siteName] = (summary.bySite[r.siteName] || 0) + 1;
      });

      return summary;
    } catch (error) {
      console.error("Failed to fetch summary:", error);
      throw new Error("Failed to fetch summary");
    }
  }),

  /**
   * Get dashboard data (combined for charts and maps)
   */
  dashboardData: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      const result = await db.select().from(collections);

      // Group by date for trend chart
      const trendData: Record<string, number> = {};
      result.forEach((r) => {
        const dateStr = r.collectionDate.toISOString().split("T")[0];
        trendData[dateStr] = (trendData[dateStr] || 0) + parseFloat(r.totalVolume as any);
      });

      // Prepare map markers
      const markers = result
        .filter((r) => r.latitude && r.longitude)
        .map((r) => ({
          id: r.id,
          lat: parseFloat(r.latitude as any),
          lng: parseFloat(r.longitude as any),
          siteName: r.siteName,
          wasteType: r.wasteType,
          volume: parseFloat(r.totalVolume as any),
          date: r.collectionDate,
        }));

      return {
        trendData,
        markers,
        summary: {
          totalRecords: result.length,
          totalVolume: result.reduce((sum, r) => sum + parseFloat(r.totalVolume as any), 0),
        },
      };
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      throw new Error("Failed to fetch dashboard data");
    }
  }),
});

