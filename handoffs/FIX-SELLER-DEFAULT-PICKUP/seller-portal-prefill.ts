/**
 * Seller New Portal pickup = the location she is sending from.
 * Ticket a282b3e2. Do not deploy this file to qcefkox.
 *
 * Wrong fix (2026-09-25): copy default_pickup_location / last_pickup_location
 * into the box. Jessica is not asking to save a typed default. She is sending
 * from Wichita. Pickup is that store.
 */

export type SellerPortalContext = {
  seller_account_id?: string;
  /** Location she is sending from (bound store / selected send-from). */
  send_from_location_id?: string | null;
  send_from_address?: string | null;
  send_from_name?: string | null;
  last_commodity?: string | null;
  confirmation_email_events?: {
    buyer_assigned?: boolean;
    pickup?: boolean;
    delivered?: boolean;
  };
};

/** Pickup text: address of the location she is sending from. Nothing else. */
export function pickupFromSendLocation(ctx?: SellerPortalContext | null): string {
  const address = (ctx?.send_from_address || "").trim();
  if (address) return address;
  return (ctx?.send_from_name || "").trim();
}

/**
 * get-seller-portal-context: after the seller row loads, attach the location
 * she is actually sending from (portal bind / her store). Use that location's
 * address. Same source as list_seller_pickup_locations.location_text for that store.
 *
 * Do not use CRM default_pickup_location / last_pickup as the answer.
 */
export function attachSendFromLocation(
  context: SellerPortalContext,
  location: {
    id?: string | null;
    location_text?: string | null;
    address?: string | null;
    name?: string | null;
  } | null,
): SellerPortalContext {
  const text = (location?.location_text || location?.address || location?.name || "").trim();
  return {
    ...context,
    send_from_location_id: location?.id ?? context.send_from_location_id ?? null,
    send_from_address: text || null,
    send_from_name: (location?.name || "").trim() || context.send_from_name || null,
  };
}

/**
 * Seller form: pickup state = pickupFromSendLocation(ctx).
 * If she changes send-from location, set pickup to that location's address.
 * After submit, reset pickup from the current send-from location — not "".
 *
 * Jessica / Wichita: sending from that store → pickup is 3636 N Oliver Wichita KS.
 */
export const GWKS_WICHITA = {
  pickup: "3636 N Oliver Wichita KS",
};
