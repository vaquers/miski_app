import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState,
  type CSSProperties,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { misses } from '@/data/misses';
import { getAvailableMisses } from '@/utils/date';
import type { DisplayMiss } from '@/types/miss';
import Galaxy from '@/components/Galaxy/Galaxy';
import { Footer } from '@/components/Footer/Footer';
import { useVisibility } from '@/hooks/useVisibility';
import './MissesScreen.css';

export const MissesScreen: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const rafRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const visibility = useVisibility();

  const allOrdered = useMemo(
    () => [...misses].sort((a, b) => a.order - b.order),
    [],
  );

  const published = useMemo(() => {
    const available = getAvailableMisses(misses);
    if (visibility) {
      return available.filter((m) => visibility[m.id] !== false);
    }
    return available;
  }, [visibility]);

  const displayMisses: DisplayMiss[] = useMemo(() => {
    const items: DisplayMiss[] = published.map((m) => ({ ...m, available: true }));
    const nextLocked = allOrdered.find(
      (m) => !published.some((p) => p.id === m.id),
    );
    if (nextLocked) {
      items.push({ ...nextLocked, available: false });
    }
    if (items.length === 0 && allOrdered.length > 0) {
      items.push({ ...allOrdered[0], available: false });
    }
    return items;
  }, [published, allOrdered]);

  const updateSections = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const vh = container.clientHeight;

    sectionsRef.current.forEach((section, i) => {
      if (!section) return;

      const sectionTop = i * vh;
      const offset = (scrollTop - sectionTop) / vh;
      const absOffset = Math.abs(offset);

      const planetScale = Math.max(0.7, 1 - absOffset * 0.3);
      const planetOpacity = Math.max(0, 1 - absOffset * 2);
      const planetY = offset * -50;

      const contentOpacity = Math.max(0, 1 - absOffset * 3);
      const contentY = offset * -30;

      const photoScale = Math.max(0.88, 1 - absOffset * 0.12);
      const photoOpacity = Math.max(0, 1 - absOffset * 2.2);
      const photoY = offset * 40;

      const glowScale = Math.max(0.5, 1 - absOffset * 0.5);
      const glowOpacity = Math.max(0, 1 - absOffset * 2);

      section.style.setProperty('--p-scale', String(planetScale));
      section.style.setProperty('--p-opacity', String(planetOpacity));
      section.style.setProperty('--p-y', `${planetY}px`);
      section.style.setProperty('--c-opacity', String(contentOpacity));
      section.style.setProperty('--c-y', `${contentY}px`);
      section.style.setProperty('--ph-scale', String(photoScale));
      section.style.setProperty('--ph-opacity', String(photoOpacity));
      section.style.setProperty('--ph-y', `${photoY}px`);
      section.style.setProperty('--g-scale', String(glowScale));
      section.style.setProperty('--g-opacity', String(glowOpacity));
    });

    const newActive = Math.round(scrollTop / vh);
    setActiveIndex(Math.min(newActive, displayMisses.length - 1));
  }, [displayMisses.length]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateSections);
    };

    updateSections();
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [updateSections]);

  const setSectionRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      sectionsRef.current[index] = el;
    },
    [],
  );

  const handleMissTap = useCallback(
    (miss: DisplayMiss) => {
      if (miss.available) {
        navigate(`/miss/${miss.id}`);
      }
    },
    [navigate],
  );

  return (
    <>
      <div className="misses-galaxy-bg">
        <Galaxy
          mouseRepulsion={false}
          mouseInteraction={false}
          density={1}
          glowIntensity={0.3}
          saturation={0}
          hueShift={140}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          repulsionStrength={2}
          autoCenterRepulsion={0}
          starSpeed={0.5}
          speed={1}
          transparent={false}
        />
      </div>
      <div className="misses-screen" ref={scrollRef}>
        {displayMisses.map((miss, index) => {
          const isLocked = !miss.available;

          const sectionClass = [
            'miss-section',
            isLocked && 'miss-section--locked',
            !isLocked && 'miss-section--tappable',
          ]
            .filter(Boolean)
            .join(' ');

          const sectionVars = {
            '--section-bg': miss.theme.background,
            '--section-glow': miss.theme.glow,
            '--section-text': miss.theme.text,
            '--section-accent': miss.theme.accent,
          } as CSSProperties;

          return (
            <section
              key={miss.id}
              ref={setSectionRef(index)}
              className={sectionClass}
              style={sectionVars}
              onClick={() => handleMissTap(miss)}
            >
              <div className={`miss-glow miss-glow--${miss.planetPosition}`} />

              <div className={`miss-planet miss-planet--${miss.planetPosition}`}>
                <img
                  src={miss.planetImage}
                  alt=""
                  className="miss-planet__img"
                  draggable={false}
                />
              </div>

              {isLocked ? (
                <div className="miss-locked-content">
                  <div className="miss-locked__icon">✧ ✧ ✧</div>
                  <p className="miss-locked__title">Скоро откроется</p>
                  <p className="miss-locked__subtitle">новая участница</p>
                </div>
              ) : (
                <div className="miss-content">
                  <div className="miss-photo">
                    <img
                      src={miss.previewImage}
                      alt={miss.firstName}
                      className="miss-photo__img"
                      draggable={false}
                    />
                  </div>

                  <div className="miss-info">
                    <h2 className="miss-info__name">{miss.firstName}{miss.lastName ? ` ${miss.lastName}` : ''}</h2>
                    <span className="miss-info__cta">
                      Открыть профиль
                    </span>
                  </div>
                </div>
              )}
            </section>
          );
        })}
        <Footer />
      </div>

      <div className="miss-progress">
        {displayMisses.map((_, i) => (
          <div
            key={i}
            className={`miss-progress__dot${i === activeIndex ? ' miss-progress__dot--active' : ''}`}
          />
        ))}
      </div>
    </>
  );
};
