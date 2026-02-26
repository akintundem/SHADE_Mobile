type MetadataInput = {
  free: boolean;
  price: string;
  enableContrib: boolean;
  contributionAmount: string;
  locationSearchQuery: string;
};

export function buildEventMetadata({
  free,
  price,
  enableContrib,
  contributionAmount,
  locationSearchQuery,
}: MetadataInput): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    access: free ? 'free' : 'paid',
  };

  if (!free) {
    const parsedPrice = Number(price);
    if (Number.isFinite(parsedPrice)) {
      metadata.price = parsedPrice;
    }
  }

  if (enableContrib) {
    const parsedContribution = Number(contributionAmount);
    metadata.contributions = {
      enabled: true,
      suggestedAmount: Number.isFinite(parsedContribution) ? parsedContribution : undefined,
    };
  }

  if (locationSearchQuery.trim().length > 0) {
    metadata.locationQuery = locationSearchQuery.trim();
  }

  return metadata;
}

export function serializeMetadata(metadata: Record<string, unknown>): string | undefined {
  return Object.keys(metadata).length ? JSON.stringify(metadata) : undefined;
}
