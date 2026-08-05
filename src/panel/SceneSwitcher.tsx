import keyIcon from '../assets/icons/key.svg';
import usersIcon from '../assets/icons/users.svg';
import styles from './SceneSwitcher.module.css';

export type SceneId = 1 | 2;

type Item = { id: SceneId; label: string; icon: string };

const ITEMS: readonly Item[] = [
  { id: 1, label: 'One platform, full journey', icon: keyIcon },
  { id: 2, label: 'A real expert, always on', icon: usersIcon },
];

/**
 * The two pills under the scene.
 *
 * One real white indicator moves below the controls. Its 213px source width is
 * the first active tab in Figma; the second state translates it 192px and
 * scales it to 204px. That keeps the transition on the compositor while still
 * landing on both frames exactly — no width animation and no clipped copy of
 * the neighbouring tab.
 *
 * These are real buttons and deliberately sit outside the panel's `aria-hidden`
 * subtree — everything else in here is decoration, but this is a control.
 */
export function SceneSwitcher({
  scene,
  onSelect,
}: {
  scene: SceneId;
  onSelect: (id: SceneId) => void;
}) {
  return (
    <div className={styles.switcher}>
      <div
        className={styles.track}
        data-active-scene={scene}
        role="group"
        aria-label="Presentation scenes"
      >
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.item} ${
              item.id === 1 ? styles.first : styles.second
            }`}
            aria-pressed={scene === item.id}
            onClick={() => onSelect(item.id)}
          >
            <PillContents item={item} />
          </button>
        ))}

        <span
          className={styles.indicator}
          data-switch-indicator
          aria-hidden="true"
        >
          <span className={styles.indicatorSurface} />
        </span>
      </div>
    </div>
  );
}

function PillContents({ item }: { item: Item }) {
  return (
    <>
      <span className={styles.iconSlot} aria-hidden="true">
        <img className={styles.icon} src={item.icon} alt="" />
      </span>
      <span className={styles.label}>{item.label}</span>
    </>
  );
}
