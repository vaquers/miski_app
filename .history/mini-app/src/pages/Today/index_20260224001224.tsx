import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { colors, cardStyle, cardTitleStyle } from './styles';
import { MainFocusCard } from './MainFocusCard';
import { Top3Card } from './Top3Card';
import { HabitsCard } from './HabitsCard';
import { FloatingButton } from './FloatingButton';
import { DumpModal } from './DumpModal';
import { EveningCheckinModal } from './EveningCheckinModal';
import { PrimaryButton } from './Buttons';

const BOTTOM_PADDING = 116;

export const TodayDashboard: FC = () => {
  const [dumpOpen, setDumpOpen] = useState(false);
  const [eveningOpen, setEveningOpen] = useState(false);
  const [showEveningPrompt, setShowEveningPrompt] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setShowEveningPrompt(hour >= 19);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: `16px 16px ${BOTTOM_PADDING}px`,
        background: 'transparent',
      }}
    >
      <h1
        style={{
          margin: '0 0 20px',
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.5px',
          color: '#fff',
        }}
      >
        Today
      </h1>

      <MainFocusCard />
      <Top3Card />
      <HabitsCard />

      {showEveningPrompt && (
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Вечерний чек-ин</h2>
          <p style={{ margin: '0 0 12px', fontSize: 14, color: colors.textSecondary }}>
            Завершите день: оценка, итоги и одно улучшение на завтра.
          </p>
          <PrimaryButton onClick={() => setEveningOpen(true)}>Завершить день</PrimaryButton>
        </div>
      )}

      <FloatingButton onClick={() => setDumpOpen(true)} />
      <DumpModal
        open={dumpOpen}
        onClose={() => setDumpOpen(false)}
        onSave={(text, tag) => console.log('Dump saved', text, tag)}
      />
      <EveningCheckinModal
        open={eveningOpen}
        onClose={() => setEveningOpen(false)}
        onSubmit={(rating, whatDone, improvement) =>
          console.log('Evening check-in', rating, whatDone, improvement)
        }
      />
    </div>
  );
};
