import { publicProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { authRouter } from "./routers/auth";
import { collectionsRouter } from "./routers/collections";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  collections: collectionsRouter,
});

export type AppRouter = typeof appRouter;

