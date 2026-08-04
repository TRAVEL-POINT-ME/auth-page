import searchIcon from '../assets/icons/search.svg';
import { cx } from '../lib/cx';
import styles from './SearchFormScene.module.css';

/**
 * Scene 1 — the search mini-form.
 *
 * Rendered in its empty resting state: both fields show a placeholder, no
 * field is focused, no chip is selected. The timeline fills it in — the
 * chips Figma shows selected in the filled state carry `data-chip-select`,
 * the rest are static.
 */

const PROPERTY_RATINGS = ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'];
const SELECTED_RATINGS = ['4 stars', '5 stars'];

const MEAL_TYPES = ['RO', 'BB', 'CB', 'HB', 'FB', 'AI'];
const SELECTED_MEALS = ['BB'];

const DESTINATION_PLACEHOLDER = 'Search by city or hotel';
/*
 * Figma draws this field already filled, since its scene 1 frames are the
 * form's resting state rather than its first frame. The beat sheet has the
 * date picker return a value at 2590ms, so at rest it needs a placeholder.
 */
const DATES_PLACEHOLDER = 'Add dates';

export function SearchFormScene() {
  return (
    <div className={styles.card}>
      <div className={styles.fields}>
        <div className={styles.destination} data-field="1">
          <div className={styles.fieldText}>
            <span className={styles.fieldLabel}>Destination</span>
            <span className={styles.fieldValueRow}>
              <span className={styles.caret} data-caret />
              <span
                className={styles.fieldValue}
                data-field-value
                data-placeholder={DESTINATION_PLACEHOLDER}
                data-empty
              >
                {DESTINATION_PLACEHOLDER}
              </span>
            </span>
          </div>
        </div>

        <div className={styles.dates} data-field="2">
          <div className={styles.fieldText}>
            <span className={styles.fieldLabel}>Select dates</span>
            <span className={styles.fieldValueRow}>
              <span
                className={styles.fieldValue}
                data-field-value
                data-placeholder={DATES_PLACEHOLDER}
                data-empty
              >
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
          options={PROPERTY_RATINGS}
          selected={SELECTED_RATINGS}
          pinFirst
        />
        <ToggleGroup
          label="Meal type:"
          options={MEAL_TYPES}
          selected={SELECTED_MEALS}
        />
      </div>
    </div>
  );
}

function ToggleGroup({
  label,
  options,
  selected,
  pinFirst = false,
}: {
  label: string;
  options: string[];
  selected: string[];
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
            {...(selected.includes(option) ? { 'data-chip-select': '' } : null)}
          >
            {option}
          </span>
        ))}
      </div>
    </div>
  );
}
