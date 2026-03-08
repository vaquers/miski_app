import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { cardStyle, cardTitleStyle, colors } from './styles';
import { PrimaryButton, SmallButton } from './Buttons';

type FocusState = 'empty' | 'task' | 'focus';

const FOCUS_DURATION_SEC = 25 * 60; // 25 min

export const MainFocusCard: FC = () => {
  const [state, setState] = useState<FocusState>('task');
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(FOCUS_DURATION_SEC);
  const [focusPaused, setFocusPaused] = useState(false);

  const taskName = 'Завершить отчёт по кварталу';
  const goalName = 'Q4 Planning';

  useEffect(() => {
    if (state !== 'focus' || focusPaused) return;
    const id = setInterval(() => {
      setFocusSecondsLeft((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [state, focusPaused]);

  if (state === 'empty') {
    return (
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Главный фокус</h2>
        <p style={{ margin: '0 0 16px', color: colors.textSecondary, fontSize: 15 }}>
          Нет главного фокуса
        </p>
        <PrimaryButton onClick={() => setState('task')}>Выбрать из недели</PrimaryButton>
      </div>
    );
  }

  if (state === 'focus') {
    const total = FOCUS_DURATION_SEC;
    const done = total - focusSecondsLeft;
    const pct = Math.round((done / total) * 100);
    const min = Math.floor(focusSecondsLeft / 60);
    const sec = focusSecondsLeft % 60;

    return (
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Главный фокус</h2>
        <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: colors.text }}>
          {taskName}
        </p>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: colors.textSecondary }}>
          Цель: {goalName}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `conic-gradient(${colors.primary} ${pct}%, ${colors.divider} ${pct}%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: colors.cardBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 700,
                color: colors.text,
              }}
            >
              {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <SmallButton onClick={() => setFocusPaused(!focusPaused)}>
              {focusPaused ? 'Продолжить' : 'Пауза'}
            </SmallButton>
            <PrimaryButton
              style={{ flex: 1 }}
              onClick={() => {
                setState('task');
                setFocusSecondsLeft(FOCUS_DURATION_SEC);
              }}
            >
              Завершить
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <h2 style={cardTitleStyle}>Главный фокус</h2>
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: colors.text }}>
        {taskName}
      </p>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: colors.textSecondary }}>
        Цель: {goalName}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <PrimaryButton style={{ flex: 1 }} onClick={() => setState('focus')}>
          Start Focus
        </PrimaryButton>
        <SmallButton>Заменить</SmallButton>
      </div>
    </div>
  );
};
