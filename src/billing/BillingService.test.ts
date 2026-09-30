/**
 * Unit tests for Google Play Billing Integration & AurumEntitlement model
 */

import { AurumEntitlement } from './entitlement';
import { AURUM_GOLD_PRODUCT_IDS, MOCK_PLAY_STORE_PRODUCTS } from './products';
import { billingService } from './BillingService';

export function runBillingTests(): { name: string; passed: boolean; message?: string }[] {
  const results: { name: string; passed: boolean; message?: string }[] = [];

  const assert = (condition: boolean, testName: string, errorDetail?: string) => {
    if (condition) {
      results.push({ name: testName, passed: true });
    } else {
      results.push({ name: testName, passed: false, message: errorDetail || 'Assertion failed' });
    }
  };

  // Test 1: Entitlement limits for Free Tier
  {
    const freeTier = new AurumEntitlement(false);
    assert(freeTier.maxHabits === 5, 'Free tier has maxHabits capped at 5', `Expected 5, got ${freeTier.maxHabits}`);
    assert(!freeTier.unlimitedLanguages, 'Free tier does not have unlimited languages');
    assert(!freeTier.fullHeatmapHistory, 'Free tier only has current month heatmap history');
    assert(!freeTier.unlimitedSkipDays, 'Free tier does not have unlimited skip days');
    assert(freeTier.monthlySkipDayLimit === 3, 'Free tier monthly skip day limit is 3');
    assert(!freeTier.fullStatsHistory, 'Free tier stats history is limited to this week');
    assert(!freeTier.customWidgetThemes, 'Free tier custom widget themes are locked');
  }

  // Test 2: Entitlement limits for Aurum Gold
  {
    const goldTier = new AurumEntitlement(true);
    assert(goldTier.maxHabits > 5000, 'Gold tier has unlimited habits (999999)');
    assert(goldTier.unlimitedLanguages, 'Gold tier unlocks all 30+ regional languages');
    assert(goldTier.fullHeatmapHistory, 'Gold tier unlocks full historical heatmap calendar');
    assert(goldTier.unlimitedSkipDays, 'Gold tier provides unlimited skip days');
    assert(goldTier.monthlySkipDayLimit > 5000, 'Gold tier has unlimited monthly skip days');
    assert(goldTier.fullStatsHistory, 'Gold tier unlocks full stats history');
    assert(goldTier.customWidgetThemes, 'Gold tier unlocks custom widget themes');
  }

  // Test 3: Product IDs Verification
  {
    assert(AURUM_GOLD_PRODUCT_IDS.MONTHLY === 'aurum_gold_monthly', 'Monthly product ID is aurum_gold_monthly');
    assert(AURUM_GOLD_PRODUCT_IDS.YEARLY === 'aurum_gold_yearly', 'Yearly product ID is aurum_gold_yearly');
    assert(AURUM_GOLD_PRODUCT_IDS.LIFETIME === 'aurum_gold_lifetime', 'Lifetime product ID is aurum_gold_lifetime');

    const monthly = MOCK_PLAY_STORE_PRODUCTS[AURUM_GOLD_PRODUCT_IDS.MONTHLY];
    const yearly = MOCK_PLAY_STORE_PRODUCTS[AURUM_GOLD_PRODUCT_IDS.YEARLY];
    const lifetime = MOCK_PLAY_STORE_PRODUCTS[AURUM_GOLD_PRODUCT_IDS.LIFETIME];

    assert(monthly.type === 'subs' && monthly.price === '$2.99', 'Monthly product is subscription at $2.99');
    assert(yearly.type === 'subs' && yearly.price === '$19.99', 'Yearly product is subscription at $19.99 with free trial');
    assert(lifetime.type === 'inapp' && lifetime.price === '$9.99', 'Lifetime product is non-consumable at $9.99');
  }

  // Test 4: BillingService purchase lifecycle
  {
    let receivedStatus: string | null = null;
    const unsubscribe = billingService.listenToPurchaseUpdates((purchase) => {
      receivedStatus = purchase.status;
    });

    const yearly = MOCK_PLAY_STORE_PRODUCTS[AURUM_GOLD_PRODUCT_IDS.YEARLY];
    billingService.buy(yearly).then(() => {
      assert(receivedStatus === 'purchased', 'BillingService buy() resolves to purchased status');
      unsubscribe();
    });
  }

  return results;
}
