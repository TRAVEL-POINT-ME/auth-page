import type { CSSProperties } from 'react';

import searchIcon from '../../assets/icons/search.svg';
import { cx } from '../../lib/cx';
import {
  DATES_VALUE,
  DESTINATION_PLACEHOLDER,
  MEAL_TYPES,
  NOTIFICATIONS,
  PROPERTY_RATINGS,
  SEARCH_STATUS,
} from './discovery.data';
import styles from './DiscoveryScene.module.css';

/**
 * Scene 1 — "One platform, full journey".
 *
 * Rendered in its resting state: the destination is empty, no field is focused,
 * no chip is picked, the status pill is down and no notification has arrived.
 * `discovery.sequence.ts` fills the form in, dissolves it, brings the map
 * forward, holds the pill over it while the pins land and then builds the stack
 * on the spot the form left.
 *
 * Three layers, all centred on the stage: no two of them ever coexist, but they
 * share an optical centre, which is what stops each handoff from reading as one
 * thing being swapped for another.
 *
 * Static markup with `data-*` hooks — the sequence drives real DOM nodes, so
 * React never re-renders while the demo plays.
 */
export function DiscoveryScene() {
  return (
    <>
      <div className={styles.formLayer}>
        <SearchForm />
      </div>
      <div className={styles.statusLayer}>
        <SearchStatus />
      </div>
      <div className={styles.stackLayer}>
        <NotificationStack />
      </div>
    </>
  );
}

function SearchForm() {
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

        {/* Filled from the start — the range is context for the search, not a
            beat in it. See `DATES_VALUE`. */}
        <div className={styles.dates} data-field="dates">
          <div className={styles.fieldText}>
            <span className={styles.fieldLabel}>Select dates</span>
            <span className={styles.fieldValueRow}>
              <span className={styles.fieldValue}>{DATES_VALUE}</span>
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

/**
 * The status pill that holds the panel while the map fills in (Figma
 * 20770:951) — frosted glass over the map, on the centre the form just left.
 *
 * Both labels live in the same grid cell and cross-fade, so the swap from
 * "searching" to a result is one object changing its mind rather than two
 * pills. The box around them is a fixed width for the same reason: the two
 * strings set within a few pixels of each other, and a pill that resized
 * mid-sentence would draw the eye to the wrong thing.
 */
function SearchStatus() {
  return (
    <div className={styles.status} data-search>
      <span className={styles.statusBox}>
        <span
          className={cx(styles.statusLabel, styles.statusShimmer)}
          data-search-label="searching"
        >
          {SEARCH_STATUS.searching}
        </span>
        <span className={styles.statusLabel} data-search-label="found">
          {SEARCH_STATUS.found}
        </span>
      </span>
    </div>
  );
}

/**
 * The stack the search turns into.
 *
 * Every card is two elements. The `.slot` holds a card's place in the stack and
 * is the only thing the sequence writes a transform to; the `.card` inside owns
 * its own entrance. Splitting them is what lets a card drop in at the same
 * moment the stack under it recoils, without the two transforms overwriting
 * each other.
 *
 * Slots are stacked on top of each other rather than laid out in a column: the
 * sequence moves them apart. Nothing here reflows as cards arrive.
 */
function NotificationStack() {
  return (
    <div className={styles.stack}>
      {NOTIFICATIONS.map((notification, index) => (
        <div key={notification.id} className={styles.slot} data-slot={notification.id}>
          <div
            /*
             * The first to arrive is the one that ends up at the bottom of the
             * finished stack, and Figma gives that one a solid fill and a
             * tighter shadow — the card in front reads crisp, the two that got
             * pushed behind it stay frosted.
             */
            className={cx(styles.card, index === 0 && styles.cardFront)}
            /* Colour-coded per notification: the glyph, its bullet and the tile
               behind it all come from one pair, set once here. */
            style={
              { '--tint': notification.tint, '--tray': notification.tray } as CSSProperties
            }
            data-card={notification.id}
          >
            <span className={styles.cardIcon}>
              <img src={notification.icon} alt="" />
            </span>
            <div className={styles.cardBody}>
              <span className={styles.cardTitleRow}>
                <span className={styles.cardDot} />
                <span className={styles.cardTitle}>{notification.title}</span>
              </span>
              <span className={styles.cardDetail}>{notification.detail}</span>
            </div>
            <span className={styles.cardTime}>{notification.time}</span>
          </div>
        </div>
      ))}
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
            {/*
             * The press scales this, not the chip: the chip owns a shared
             * border with its neighbour, and shrinking the box would pull that
             * border off the seam and open a white gap inside the group.
             */}
            <span className={styles.toggleLabel} data-chip-label>
              {option}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
