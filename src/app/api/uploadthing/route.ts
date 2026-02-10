import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

/**
 * Uploadthing API route handler
 */
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
