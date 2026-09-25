/**
 * Drop-in for WMG seller New Portal (live form GCe).
 * Copy the two helpers into get-seller-portal-context + the load-request form.
 * Do not deploy this file to qcefkox. Staging / Vercel embed only.
 */

export type SellerPortalContext = {
  seller_account_id?: string;
  last_commodity?: string;
  confirmation_email_events?: {
    buyer_assigned?: boolean;
    pickup?: boolean;
    delivered?: boolean;
  };
  default_pickup_location?: string | null;
  last_pickup_location?: string | null;
  default_shipping_hours?: string | null;
  last_notes?: string | null;
};

export function defaultPickupFromContext(ctx?: SellerPortalContext | null): string {
  return (ctx?.default_pickup_location || ctx?.last_pickup_location || "").trim();
}

export function defaultNotesFromContext(ctx?: SellerPortalContext | null): string {
  const hours = (ctx?.default_shipping_hours || "").trim();
  if (hours) {
    const stamp = /shipping hours/i.test(hours) ? hours : `SHIPPING HOURS ${hours}`;
    return stamp;
  }
  return (ctx?.last_notes || "").trim();
}

/** Call from get-seller-portal-context after the seller row is loaded. */
export function attachPickupDefaults(
  context: SellerPortalContext,
  sellerRow: {
    default_pickup_location?: string | null;
    last_pickup_location?: string | null;
    default_shipping_hours?: string | null;
    last_notes?: string | null;
  },
): SellerPortalContext {
  return {
    ...context,
    default_pickup_location: sellerRow.default_pickup_location ?? context.default_pickup_location ?? null,
    last_pickup_location: sellerRow.last_pickup_location ?? context.last_pickup_location ?? null,
    default_shipping_hours: sellerRow.default_shipping_hours ?? context.default_shipping_hours ?? null,
    last_notes: sellerRow.last_notes ?? context.last_notes ?? null,
  };
}

/**
 * In the seller form, replace blank useState("") for pickup (U/Z) and notes (B/W):
 *
 *   const pickup0 = defaultPickupFromContext(ctx)
 *   const notes0 = defaultNotesFromContext(ctx)
 *   const [U, Z] = useState(pickup0)
 *   const [B, W] = useState(notes0)
 *
 * And in Vs() reset after submit, set Z(defaultPickupFromContext(ce)) and
 * W(defaultNotesFromContext(ce)) instead of Z("") / W("").
 *
 * Goodwill KS expected after bake:
 *   pickup = "3636 N Oliver Wichita KS"
 *   notes  = "SHIPPING HOURS 8AM-2PM"
 */
export const GWKS_SEED = {
  pickup: "3636 N Oliver Wichita KS",
  shipping_hours: "8AM-2PM",
};
