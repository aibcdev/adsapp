import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  commissionForPartnerSpend,
  PARTNER_COMMISSION_BASE_PCT,
  PARTNER_COMMISSION_TIER_PCT,
} from "./partners.js";

describe("commissionForPartnerSpend", () => {
  it("applies 15% when all spend is below the $15k threshold", () => {
    const commission = commissionForPartnerSpend(0, 10_000);
    assert.equal(commission, 10_000 * PARTNER_COMMISSION_BASE_PCT);
  });

  it("splits 15% and 20% when crossing the $15k threshold", () => {
    const commission = commissionForPartnerSpend(14_000, 2_000);
    assert.equal(
      commission,
      1_000 * PARTNER_COMMISSION_BASE_PCT + 1_000 * PARTNER_COMMISSION_TIER_PCT,
    );
  });

  it("applies 20% when settled spend is already at or above $15k", () => {
    const commission = commissionForPartnerSpend(20_000, 5_000);
    assert.equal(commission, 5_000 * PARTNER_COMMISSION_TIER_PCT);
  });
});
