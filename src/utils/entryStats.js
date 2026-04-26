function getValidDate(value) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function countEntriesSince(entries, startDate) {
  return entries.filter((entry) => {
    const createdAt = getValidDate(entry?.createdAt);
    return createdAt && createdAt >= startDate;
  }).length;
}

function getUniqueEntryDayKeys(entries) {
  return [
    ...new Set(
      entries
        .map((entry) => getValidDate(entry?.createdAt))
        .filter(Boolean)
        .map(getDateKey)
    ),
  ].sort();
}

function getMostUsedType(entries) {
  if (entries.length === 0) {
    return '-';
  }

  const counts = entries.reduce((map, entry) => {
    const key = entry?.type?.trim() || 'Other';
    map[key] = (map[key] ?? 0) + 1;
    return map;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function getCurrentStreak(dayKeys) {
  if (dayKeys.length === 0) {
    return 0;
  }

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedDesc = [...dayKeys].sort().reverse();
  const latestKey = sortedDesc[0];

  if (latestKey !== getDateKey(today)) {
    today.setDate(today.getDate() - 1);
  }

  for (const dayKey of sortedDesc) {
    if (dayKey !== getDateKey(today)) {
      break;
    }

    streak += 1;
    today.setDate(today.getDate() - 1);
  }

  return streak;
}

function getLongestStreak(dayKeys) {
  if (dayKeys.length === 0) {
    return 0;
  }

  let longestStreak = 1;
  let currentStreak = 1;

  for (let index = 1; index < dayKeys.length; index += 1) {
    const previousDate = getValidDate(dayKeys[index - 1]);
    const currentDate = getValidDate(dayKeys[index]);

    if (!previousDate || !currentDate) {
      currentStreak = 1;
      continue;
    }

    const expectedNextDay = new Date(previousDate);
    expectedNextDay.setDate(expectedNextDay.getDate() + 1);

    if (getDateKey(expectedNextDay) === dayKeys[index]) {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

function getRatings(entries) {
  return entries
    .map((entry) => Number.parseFloat(String(entry?.rating ?? '').replace(',', '.')))
    .filter((rating) => !Number.isNaN(rating));
}

function getAverageRating(entries) {
  const ratings = getRatings(entries);

  if (ratings.length === 0) {
    return '-';
  }

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return (total / ratings.length).toFixed(1);
}

function getMostFrequentRating(entries) {
  const ratings = getRatings(entries);

  if (ratings.length === 0) {
    return '-';
  }

  const counts = ratings.reduce((map, rating) => {
    const key = rating % 1 === 0 ? String(rating) : rating.toFixed(1);
    map[key] = (map[key] ?? 0) + 1;
    return map;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function getHighestRatedCategory(entries) {
  const buckets = entries.reduce((map, entry) => {
    const rating = Number.parseFloat(String(entry?.rating ?? '').replace(',', '.'));

    if (Number.isNaN(rating)) {
      return map;
    }

    const type = entry?.type?.trim() || 'Other';

    if (!map[type]) {
      map[type] = {
        total: 0,
        count: 0,
      };
    }

    map[type].total += rating;
    map[type].count += 1;

    return map;
  }, {});

  const ranked = Object.entries(buckets)
    .map(([type, data]) => ({
      type,
      average: data.total / data.count,
    }))
    .sort((a, b) => b.average - a.average);

  return ranked[0]?.type ?? '-';
}

export function getEntryStats(entries) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const dayKeys = getUniqueEntryDayKeys(safeEntries);

  return {
    mostUsedType: getMostUsedType(safeEntries),
    entriesThisWeek: countEntriesSince(safeEntries, startOfWeek),
    currentStreak: getCurrentStreak(dayKeys),
    longestStreak: getLongestStreak(dayKeys),
    averageRating: getAverageRating(safeEntries),
    totalEntries: safeEntries.length,
    entriesThisMonth: countEntriesSince(safeEntries, startOfMonth),
    entriesToday: countEntriesSince(safeEntries, today),
    mostFrequentRating: getMostFrequentRating(safeEntries),
    highestRatedCategory: getHighestRatedCategory(safeEntries),
  };
}
