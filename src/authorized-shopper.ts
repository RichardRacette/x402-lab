import {
  defaultShopperDependencies,
  executePurchase,
  type ExecutePurchaseResult,
  type ShopperConfig,
  type ShopperGatewayDependencies,
  type ShopperRequest
} from "./shopper-gateway.js";
import {
  assertPurchaseAuthorization,
  type PurchaseAuthorization
} from "./trust-boundary.js";

export interface AuthorizedShopperRequest extends ShopperRequest {
  authorization: PurchaseAuthorization;
}

/**
 * Privileged purchase entrypoint.
 *
 * Callers must present an owner-issued, single-purchase capability bound to the
 * exact endpoint/source/question tuple. The authorization is validated before
 * the raw shopper gateway can acquire its lock or load credentials.
 */
export async function executeAuthorizedPurchase(
  request: AuthorizedShopperRequest,
  config: ShopperConfig,
  dependencies: ShopperGatewayDependencies = defaultShopperDependencies
): Promise<ExecutePurchaseResult> {
  const { authorization, ...intent } = request;
  assertPurchaseAuthorization(intent, authorization);
  return executePurchase(intent, config, dependencies);
}
