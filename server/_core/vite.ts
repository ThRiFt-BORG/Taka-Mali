import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // Always reload index.html in dev mode
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

// ✅ Fixed serveStatic for production
export function serveStatic(app: Express) {
  // Always serve from dist/public (the Vite build output)
  const clientDist = path.resolve(import.meta.dirname, "../../dist/public");

  if (!fs.existsSync(clientDist)) {
    console.error(
      `❌ Could not find the build directory: ${clientDist}\n➡️ Make sure to run 'pnpm build' before starting the server.`
    );
    process.exit(1);
  }

  // Serve static assets (JS, CSS, images)
  app.use(express.static(clientDist));

  // Fallback: send index.html for all non-API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });

  console.log(`[Static] Serving frontend from: ${clientDist}`);
}
