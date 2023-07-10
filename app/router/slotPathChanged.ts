function getSlotsHash(params: URLSearchParams) {
  const slots = [];

  for (const [key, value] of params.entries()) {
    if (key.startsWith("slot-")) {
      slots.push(`${key}=${value}`);
    }
  }

  return slots.sort().join("");
}

export const slotPathsChanged = (currentUrl: URL, nextUrl: URL) => {
  const currentSlotHash = getSlotsHash(currentUrl.searchParams);
  const nextSlotHash = getSlotsHash(nextUrl.searchParams);

  return currentSlotHash != nextSlotHash;
};
