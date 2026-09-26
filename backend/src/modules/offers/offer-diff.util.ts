/**
 * Computes deep differences between previous and new snapshots for Offer Versioning
 */
export function computeSnapshotDiff(
  previous: Record<string, unknown> | null,
  current: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  if (!previous) {
    return {
      _initial: {
        from: null,
        to: 'Initial version created',
      },
    };
  }

  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);

  for (const key of allKeys) {
    // Ignore internal timestamp fields
    if (['updatedAt', 'currentVersionNumber', 'createdAt'].includes(key)) {
      continue;
    }

    const prevVal = previous[key];
    const currVal = current[key];

    const prevJson = JSON.stringify(prevVal);
    const currJson = JSON.stringify(currVal);

    if (prevJson !== currJson) {
      diff[key] = {
        from: prevVal === undefined ? null : prevVal,
        to: currVal === undefined ? null : currVal,
      };
    }
  }

  return diff;
}
