export const ENTRY_TYPES = Object.freeze([
  { label: 'Movie' },
  { label: 'Series' },
  { label: 'Documentary' },
  { label: 'Anime' },
  { label: 'Music' },
  { label: 'Podcast' },
  { label: 'Concert' },
  { label: 'Theatre' },
  { label: 'Opera' },
  { label: 'Ballet' },
  { label: 'Stand-up' },
  { label: 'Match' },
  { label: 'Gaming' },
  { label: 'Book' },
  { label: 'Blog' },
  { label: 'Exhibition' },
  { label: 'Festival' },
  { label: 'Other' },
]);

const ENTRY_TYPE_MAP = ENTRY_TYPES.reduce((map, entryType) => {
  map[entryType.label] = entryType;
  return map;
}, {});

export function getEntryType(typeLabel) {
  return ENTRY_TYPE_MAP[typeLabel] ?? ENTRY_TYPE_MAP.Other;
}
