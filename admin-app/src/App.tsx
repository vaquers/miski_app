import { useState, useEffect, useCallback, useRef } from 'react';
import {
  login,
  getToken,
  setToken,
  getVotingStatus,
  setVotingStatus,
  getResults,
  getVoters,
  getMisses,
  type VotingStatus,
  type MissInfo,
} from './api';

// ─── Types ──────────────────────────────────────────────────────

type VoteRow = {
  participant_id: number;
  name: string;
  defile: number;
  photos: number;
  total: number;
};

type Voter = {
  tg_id: number;
  first_name: string;
  last_name: string;
  voter_class: string;
  participant_id: number;
  nomination: string;
  created_at?: string;
};

// ─── Login ──────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      await login(pw);
      onLogin();
    } catch {
      setErr('Неверный пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>Мисс Лицей</h1>
        <p className="login-sub">Панель администратора</p>
        <input
          type="password"
          placeholder="Пароль"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={loading || !pw}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
        {err && <p className="login-err">{err}</p>}
      </form>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [status, setStatus] = useState<VotingStatus | null>(null);
  const [votes, setVotes] = useState<VoteRow[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [misses, setMisses] = useState<MissInfo[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const missNameMap = useCallback(
    () => new Map(misses.map((m) => [m.id, m.name])),
    [misses],
  );

  const fetchAll = useCallback(async () => {
    const errors: string[] = [];

    // Voting status (admin endpoint)
    try {
      const st = await getVotingStatus();
      setStatus(st);
    } catch (e: any) {
      if (e.message === 'unauthorized') { onLogout(); return; }
      errors.push('Статус голосования');
    }

    // Results (public endpoint)
    try {
      const res = await getResults();
      const resultArr = Array.isArray(res) ? res : [];
      const nameMap = missNameMap();

      const byParticipant = new Map<number, VoteRow>();
      for (const r of resultArr) {
        const pid = r.participant_id ?? r.id;
        const name =
          r.name || r.firstName || nameMap.get(String(pid)) || `#${pid}`;

        if (!byParticipant.has(pid)) {
          byParticipant.set(pid, {
            participant_id: pid, name, defile: 0, photos: 0, total: 0,
          });
        }
        const row = byParticipant.get(pid)!;
        if (row.name.startsWith('#')) row.name = name;

        const count = r.votes ?? r.count ?? 1;
        const nomination = r.nomination ?? r.stage ?? r.category ?? '';
        if (nomination === 'defile') row.defile += count;
        else if (nomination === 'photos') row.photos += count;
        else row.total += count;
      }

      for (const row of byParticipant.values()) {
        row.total = row.defile + row.photos + row.total;
      }

      setVotes([...byParticipant.values()].sort((a, b) => b.total - a.total));
    } catch {
      errors.push('Результаты');
    }

    // Voters (public endpoint)
    try {
      const vt = await getVoters();
      setVoters(Array.isArray(vt) ? (vt as Voter[]) : []);
    } catch {
      errors.push('Голоса');
    }

    setLastUpdate(new Date());
    setError(errors.length ? `Не удалось загрузить: ${errors.join(', ')}` : '');
  }, [missNameMap, onLogout]);

  useEffect(() => {
    getMisses().then(setMisses).catch(() => {});
  }, []);

  useEffect(() => {
    fetchAll();
    intervalRef.current = setInterval(fetchAll, 5000);
    return () => clearInterval(intervalRef.current);
  }, [fetchAll]);

  const toggleVoting = async (nomination: 'defile' | 'photos') => {
    if (!status || toggling) return;
    setToggling(nomination);
    try {
      const updated = await setVotingStatus(nomination, !status[nomination]);
      setStatus(updated);
    } catch (e: any) {
      if (e.message === 'unauthorized') onLogout();
    } finally {
      setToggling(null);
    }
  };

  const totalVotes = votes.reduce((s, v) => s + v.total, 0);
  const maxVotes = Math.max(...votes.map((v) => v.total), 1);

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div>
          <h1>Мисс Лицей — Админ</h1>
          {lastUpdate && (
            <span className="dash-time">
              Обновлено: {lastUpdate.toLocaleTimeString('ru')}
            </span>
          )}
        </div>
        <button className="btn-logout" onClick={onLogout}>
          Выйти
        </button>
      </header>

      {error && <div className="dash-error">{error}</div>}

      {/* Voting controls */}
      <section className="card">
        <h2>Управление голосованием</h2>
        <p className="card-hint">
          Нажмите на кнопку, чтобы открыть или закрыть голосование.
        </p>
        <div className="voting-controls">
          {(['defile', 'photos'] as const).map((nom) => {
            const isOpen = status?.[nom] ?? false;
            const label = nom === 'defile' ? 'Дефиле' : 'Фотосессия';
            const loading = toggling === nom;
            return (
              <div className="control-row" key={nom}>
                <div className="control-info">
                  <span className="control-label">{label}</span>
                  <span className={`control-status ${isOpen ? 'open' : 'closed'}`}>
                    {isOpen ? '● Открыто' : '○ Закрыто'}
                  </span>
                </div>
                <button
                  className={`toggle-btn ${isOpen ? 'toggle-close' : 'toggle-open'}`}
                  onClick={() => toggleVoting(nom)}
                  disabled={loading}
                >
                  {loading ? '...' : isOpen ? 'Закрыть' : 'Открыть'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats summary */}
      <section className="card">
        <h2>
          Результаты голосования
          <span className="badge">{totalVotes} голосов</span>
        </h2>
        <div className="results-table">
          <div className="rt-header">
            <span className="rt-name">Участница</span>
            <span className="rt-num">Дефиле</span>
            <span className="rt-num">Фото</span>
            <span className="rt-num">Итого</span>
          </div>
          {votes.map((v) => (
            <div className="rt-row" key={v.participant_id}>
              <span className="rt-name">{v.name}</span>
              <span className="rt-num">{v.defile}</span>
              <span className="rt-num">{v.photos}</span>
              <span className="rt-num rt-total">{v.total}</span>
              <div
                className="rt-bar"
                style={{ width: `${(v.total / maxVotes) * 100}%` }}
              />
            </div>
          ))}
          {votes.length === 0 && (
            <p className="empty">Голосов пока нет</p>
          )}
        </div>
      </section>

      {/* Recent voters */}
      <section className="card">
        <h2>
          Последние голоса
          <span className="badge">{voters.length}</span>
        </h2>
        <div className="voters-list">
          {voters
            .slice(-30)
            .reverse()
            .map((v, i) => (
              <div className="voter-row" key={`${v.tg_id}-${v.nomination}-${i}`}>
                <span className="voter-name">
                  {v.first_name} {v.last_name}
                </span>
                <span className="voter-class">{v.voter_class}</span>
                <span className="voter-nom">{v.nomination}</span>
              </div>
            ))}
          {voters.length === 0 && (
            <p className="empty">Нет данных</p>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Root ───────────────────────────────────────────────────────

export function App() {
  const [authed, setAuthed] = useState(!!getToken());

  const handleLogout = () => {
    setToken(null);
    setAuthed(false);
  };

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={handleLogout} />;
}
