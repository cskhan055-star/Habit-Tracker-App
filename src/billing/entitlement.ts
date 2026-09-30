/**
 * Aurum Entitlement Model
 * Centralizes all premium checks through a single source of truth.
 * Corresponds to lib/billing/entitlement.dart in the Flutter spec.
 */

export class AurumEntitlement {
  readonly isGold: boolean;

  constructor(isGold: boolean) {
    this.isGold = isGold;
  }

  /**
   * Maximum allowed active habits.
   * Free tier: 5 habits maximum.
   * Gold tier: unlimited (999999).
   */
  get maxHabits(): number {
    return this.isGold ? 999999 : 5;
  }

  /**
   * Access to all 30+ regional languages.
   * Free tier: English only.
   */
  get unlimitedLanguages(): boolean {
    return this.isGold;
  }

  /**
   * Full historical heatmap calendar.
   * Free tier: current month only.
   */
  get fullHeatmapHistory(): boolean {
    return this.isGold;
  }

  /**
   * Unlimited travel protection / skip days.
   * Free tier: 3 per month limit.
   */
  get unlimitedSkipDays(): boolean {
    return this.isGold;
  }

  get monthlySkipDayLimit(): number {
    return this.isGold ? 999999 : 3;
  }

  /**
   * All-time historical statistics & breakdowns.
   * Free tier: this week only.
   */
  get fullStatsHistory(): boolean {
    return this.isGold;
  }

  /**
   * Custom widget themes and multi-sizes.
   */
  get customWidgetThemes(): boolean {
    return this.isGold;
  }

  /**
   * AI Coach Insights (Phase 2).
   */
  get aiCoachEnabled(): boolean {
    return this.isGold;
  }
}
