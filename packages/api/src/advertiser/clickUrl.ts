/** Append aibc UTM params for advertiser click attribution. */
export function withAibcUtm(destinationUrl: string, campaignId: string): string {
  try {
    const url = new URL(destinationUrl);
    if (!url.searchParams.has("utm_source")) url.searchParams.set("utm_source", "aibc");
    if (!url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", "ide");
    if (!url.searchParams.has("utm_campaign")) url.searchParams.set("utm_campaign", campaignId);
    return url.toString();
  } catch {
    return destinationUrl;
  }
}
