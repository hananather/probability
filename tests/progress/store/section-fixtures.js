import { migrateLegacyProgress } from '@/lib/progress/legacyMigration';

export const SECTION_KEY = 'probability:resume:section:/chapter1/01-foundations:foundations';
export const SECTION_CHILD = 'chapter-1:foundations:foundations';
export const SECTION_RAW = JSON.stringify({ index: 0, sectionId: 'set-operations' });

/** A valid pre-mapping record: the source was already observed and only archived. */
export function withArchivedSection(record, { key = SECTION_KEY, raw = SECTION_RAW } = {}) {
  const result = JSON.parse(JSON.stringify(record));
  const migrated = migrateLegacyProgress({ [key]: raw }, result);
  result.data.migration.sources[key] = migrated.migration.sources[key];
  result.data.unattributedLegacy[key] = { raw, issues: ['unattributed-source'] };
  result.data.migration.issues.push({ key, code: 'unattributed-source' });
  result.legacyObserved[key] = raw;
  delete result.data.legacySectionResumeByDevice;
  return result;
}
