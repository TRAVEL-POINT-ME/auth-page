import searchIcon from '../../assets/icons/search.svg';
import { cx } from '../../lib/cx';
import {
  DATES_PLACEHOLDER,
  DESTINATION_PLACEHOLDER,
  MEAL_TYPES,
  PROPERTY_RATINGS,
} from './discovery.data';
import styles from './DiscoveryScene.module.css';

/**
 * Scene 1 — "One platform, full journey".
 *
 * Rendered in its empty resting state: both fields show a placeholder, no
 * field is focused, no chip is picked. `discovery.sequence.ts` fills it in,
 * then dissolves it and brings the map forward.
 *
 * Static markup with `data-*` hooks — the sequence drives real DOM nodes, so
 * React never re-renders while the demo plays.
 */
export function DiscoveryScene() {
  return (
    <div className={styles.form} data-form>
      <div className={styles.fields}>
        <div className={styles.destination} data-field="destination">
          <div className={styles.fieldText}>
            <span className={styles.fieldLabel}>Destination</span>
            <span className={styles.fieldValueRow}>
              <span className={styles.fieldValue} data-value="destination" data-empty>
                {DESTINATION_PLACEHOLDER}
              </span>
              <span className={styles.caret} data-caret />
            </span>
          </div>
        </div>

        <div className={styles.dates} data-field="dates">
          <div className={styles.fieldText}>
            <span className={styles.fieldLabel}>Select dates</span>
            <span className={styles.fieldValueRow}>
              <span className={styles.fieldValue} data-value="dates" data-empty>
                {DATES_PLACEHOLDER}
              </span>
            </span>
          </div>
        </div>

        <div className={styles.submit} data-submit>
          <span className={styles.submitIcon}>
            <img src={searchIcon} alt="" />
          </span>
        </div>
      </div>

      <div className={styles.filters}>
        <ToggleGroup
          label="Property rating:"
          group="rating"
          options={PROPERTY_RATINGS}
          pinFirst
        />
        <ToggleGroup label="Meal type:" group="meal" options={MEAL_TYPES} />
      </div>
    </div>
  );
}

function ToggleGroup({
  label,
  group,
  options,
  pinFirst = false,
}: {
  label: string;
  group: string;
  options: readonly string[];
  /** Figma pins the first rating chip rather than letting it flex. */
  pinFirst?: boolean;
}) {
  return (
    <div className={styles.filter}>
      <span className={styles.filterLabel}>{label}</span>
      <div className={styles.toggleGroup}>
        {options.map((option, index) => (
          <span
            key={option}
            className={cx(styles.toggle, pinFirst && index === 0 && styles.toggleFixed)}
            data-chip={`${group}:${option}`}
          >
            {option}
          </span>
        ))}
      </div>
    </div>
  );
}
