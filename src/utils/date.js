export function parseDateValue(value) {
  if (typeof value !== 'string') return null;

  const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;

  const [, dayText, monthText, yearText] = match;
  const day = Number.parseInt(dayText, 10);
  const month = Number.parseInt(monthText, 10) - 1;
  const year = Number.parseInt(yearText, 10);

  const parsedDate = new Date(year, month, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}