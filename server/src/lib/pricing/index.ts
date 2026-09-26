import { pool } from "../../db/pool";
import { CachedPricingProvider } from "./cache";
import { YahooPricingProvider } from "./yahooProvider";
import type { PricingProvider } from "./types";

function createPricingProvider(): PricingProvider {
  const providerName = process.env.PRICING_PROVIDER ?? "yahoo";

  switch (providerName) {
    case "yahoo":
      return new CachedPricingProvider(new YahooPricingProvider(), pool);
    default:
      throw new Error(`Unknown PRICING_PROVIDER "${providerName}" -- only "yahoo" is implemented`);
  }
}

// Built once, at module load, and shared by the whole app -- same singleton
// pattern as the connection pool it wraps.
export const pricingProvider = createPricingProvider();
