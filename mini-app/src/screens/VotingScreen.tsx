import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { initData } from '@tma.js/sdk-react';

import { misses } from '@/data/misses';
import Galaxy from '@/components/Galaxy/Galaxy';
import { Footer } from '@/components/Footer/Footer';
import crownImg from '../../assets/miski_main/crown.png';
import { getParticipants, vote, type VotingNomination } from '@/api/votingApi';

import './VotingScreen.css';

type VotingStage = 'defile' | 'photos' | 'success';

const AVATAR_CENTER_X = 50;
const AVATAR_CENTER_Y = 50;
const AVATAR_RADIUS_X = 38;
const AVATAR_RADIUS_Y = AVATAR_RADIUS_X;

const AVATAR_ANGLES_DEG = [-90, -45, 0, 45, 90, 135, 180, 225] as const;

const VOTING_STAGES: Record<
  Exclude<VotingStage, 'success'>,
  { id: VotingStage; line1: string; line2: string }
> = {
  defile: {
    id: 'defile',
    line1: 'Какая мисска',
    line2: 'тебе больше всего понравилась?',
  },
  photos: {
    id: 'photos',
    line1: 'У кого была',
    line2: 'лучшая фотосессия?',
  },
};

export const VotingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const galaxy = useMemo(
    () => (
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
    ),
    [],
  );

  const localParticipants = useMemo(
    () =>
      [...misses]
        .sort((a, b) => a.order - b.order)
        .map((miss) => ({
          id: miss.id,
          name: `${miss.firstName} ${miss.lastName}`.trim(),
          image: miss.previewImage,
        })),
    [],
  );

  const initialStage = useMemo<VotingStage>(() => {
    const s = searchParams.get('stage');
    return s === 'photos' ? 'photos' : 'defile';
  }, [searchParams]);

  const [stage, setStage] = useState<VotingStage>(initialStage);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [flyingIndex, setFlyingIndex] = useState<number | null>(null);
  const [pendingStage, setPendingStage] = useState<VotingStage | null>(null);
  const [isAnimatingVote, setIsAnimatingVote] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<
    { id: string; name: string; image: string }[] | null
  >(null);

  const participants = remoteParticipants ?? localParticipants;

  if (!participants.length) {
    return null;
  }

  const currentParticipant = participants[selectedIndex] ?? participants[0];

  const tgId = useMemo(() => {
    const userId = initData.state()?.user?.id;
    return typeof userId === 'number' ? userId : null;
  }, []);

  useEffect(() => {
    setStage(initialStage);
    setSelectedIndex(0);
  }, [initialStage]);

  useEffect(() => {
    getParticipants()
      .then((list) => {
        const byId = new Map(localParticipants.map((p) => [p.id, p]));
        const merged = (Array.isArray(list) ? list : [])
          .map((p) => {
            const id = String((p as any).id ?? '');
            if (!id) return null;
            const local = byId.get(id);
            const name =
              (p as any).name ||
              `${(p as any).firstName ?? ''} ${(p as any).lastName ?? ''}`.trim() ||
              local?.name ||
              id;
            return {
              id,
              name,
              image: (p as any).previewImage || local?.image || '',
            };
          })
          .filter(Boolean) as { id: string; name: string; image: string }[];

        if (merged.length) setRemoteParticipants(merged);
      })
      .catch(() => {
        // если API недоступно, остаёмся на локальных данных
      });
  }, [localParticipants]);

  const handleVote = () => {
    if (isAnimatingVote) return;
    setVoteError(null);

    if (!tgId) {
      setVoteError('Не удалось получить tg id пользователя.');
      return;
    }

    const nextStage: VotingStage | null =
      stage === 'defile' ? 'photos' : stage === 'photos' ? 'success' : null;

    if (!nextStage) return;

    setIsAnimatingVote(true);
    setFlyingIndex(selectedIndex);
    setPendingStage(nextStage);

    const nomination: VotingNomination =
      stage === 'photos' ? 'photos' : 'defile';
    void vote({
      tg_id: tgId,
      participant_id: currentParticipant.id,
      nomination,
    }).catch((e) => {
      setVoteError(
        e instanceof Error ? e.message : 'Не удалось отправить голос. Попробуй ещё раз.',
      );
      setPendingStage(null);
      setFlyingIndex(null);
      setIsAnimatingVote(false);
    });
  };

  useEffect(() => {
    if (!isAnimatingVote || !pendingStage) return;

    const timeout = window.setTimeout(() => {
      setStage(pendingStage);
      if (pendingStage !== 'success') {
        setSelectedIndex(0);
      }
      setPendingStage(null);
      setFlyingIndex(null);
      setIsAnimatingVote(false);
    }, 1850);

    return () => window.clearTimeout(timeout);
  }, [isAnimatingVote, pendingStage]);

  const isSuccess = stage === 'success';
  const isPhotosStage = stage === 'photos';

  return (
    <div className="voting-screen">
      <div className="voting-galaxy-bg">
        {galaxy}
      </div>

      {!isSuccess && (
        <div className="voting-main">
          <header className="voting-header">
            <p className="voting-title-line-1">
              {VOTING_STAGES[stage].line1}
            </p>
            <p className="voting-title-line-2 voting-decorative">
              {VOTING_STAGES[stage].line2}
            </p>
          </header>

          <main className="voting-body" aria-label="Выбор участницы">
            <div className="voting-grid">
              <div
                className={`voting-grid-center${
                  isAnimatingVote ? ' voting-grid-center--receive' : ''
                }`}
              >
                <img
                  src={crownImg}
                  alt="Корона"
                  className="voting-grid-center-image"
                />
              </div>
              {participants.map((participant, index) => {
                const isActive = index === selectedIndex;
                const isFlying = flyingIndex === index;
                const angleDeg = AVATAR_ANGLES_DEG[index % AVATAR_ANGLES_DEG.length];
                const angleRad = (angleDeg * Math.PI) / 180;
                const left = AVATAR_CENTER_X + AVATAR_RADIUS_X * Math.cos(angleRad);
                const top = AVATAR_CENTER_Y + AVATAR_RADIUS_Y * Math.sin(angleRad);
                const position = {
                  left: `${left}%`,
                  top: `${top}%`,
                };

                return (
                  <button
                    key={participant.id}
                    type="button"
                    className={`voting-avatar${isActive ? ' voting-avatar--active' : ''}${
                      isFlying ? ' voting-avatar--fly' : ''
                    }`}
                    onClick={() => {
                      if (isAnimatingVote) return;
                      setSelectedIndex(index);
                    }}
                    style={position}
                    disabled={isAnimatingVote}
                  >
                    <div className="voting-avatar-ring">
                      <div className="voting-avatar-inner">
                        <img
                          src={participant.image}
                          alt={participant.name}
                          className="voting-avatar-image"
                          width={100}
                          height={100}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="voting-selected-name voting-decorative">
              {currentParticipant.name}
            </div>
          </main>

          <div className="voting-cta-wrap">
            {isPhotosStage && (
              <button
                type="button"
                className="voting-secondary-button"
                onClick={() =>
                  navigate(`/miss/${currentParticipant.id}#gallery`, {
                    state: { returnTo: '/voting?stage=photos' },
                  })
                }
                disabled={isAnimatingVote}
              >
                Открыть фотосессию
              </button>
            )}
            <button
              type="button"
              className="voting-cta-button"
              onClick={handleVote}
              disabled={isAnimatingVote}
            >
              Голосовать
            </button>
            {voteError && <div className="voting-error">{voteError}</div>}
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="voting-success">
          <h1 className="voting-success-title">Спасибо за голос!</h1>
          <p className="voting-success-subtitle">
            Ваш выбор в обеих номинациях учтён.
          </p>
        </div>
      )}

      <Footer />
    </div>
  );
};
