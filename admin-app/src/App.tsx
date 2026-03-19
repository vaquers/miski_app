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
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const missNameMap = useCallback(
    () => new Map(misses.map((m) => [m.id, m.name])),
    [misses],
  );

  const fetchAll = useCallback(async () => {
    try {
      const [st, res, vt] = await Promise.all([
        getVotingStatus(),
        getResults(),
        getVoters(),
      ]);
      setStatus(st);
      setLastUpdate(new Date());
      setError('');

      const resultArr = Array.isArray(res) ? res : [];
      const nameMap = missNameMap();

      const byParticipant = new Map<number, VoteRow>();
      for (const r of resultArr) {
        const pid = r.participant_id ?? r.id;
        const existing = byParticipant.get(pid);
        const name =
          r.name || r.firstName || nameMap.get(String(pid)) || `#${pid}`;

        if (!existing) {
          byParticipant.set(pid, {
            participant_id: pid,
            name,
            defile: 0,
            photos: 0,
            total: 0,
          });
        }
        const row = byParticipant.get(pid)!;
        if (!row.name || row.name.startsWith('#')) row.name = name;

        const count = r.votes ?? r.count ?? 1;
        const nomination = r.nomination ?? r.stage ?? r.category ?? '';
        if (nomination === 'defile') row.defile += count;
        else if (nomination === 'photos') row.photos += count;
        else row.total += count;
      }

      for (const row of byParticipant.values()) {
        row.total = row.defile + row.photos + row.total;
      }

      setVotes(
        [...byParticipant.values()].sort((a, b) => b.total - a.total),
      );

      setVoters(Array.isArray(vt) ? (vt as Voter[]) : []);
    } catch (e: any) {
      if (e.message === 'unauthorized') {
        onLogout();
        return;
      }
      setError(e.message || 'Ошибка загрузки');
    }
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
    if (!status) return;
    try {
      const updated = await setVotingStatus(nomination, !status[nomination]);
      setStatus(updated);
    } catch (e: any) {
      if (e.message === 'unauthorized') onLogout();
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
        <div className="voting-controls">
          <div className="control-row">
            <span className="control-label">Дефиле</span>
            <button
              className={`toggle ${status?.defile ? 'on' : 'off'}`}
              onClick={() => toggleVoting('defile')}
            >
              {status?.defile ? 'Открыто' : 'Закрыто'}
            </button>
          </div>
          <div className="control-row">
            <span className="control-label">Фотосессия</span>
            <button
              className={`toggle ${status?.photos ? 'on' : 'off'}`}
              onClick={() => toggleVoting('photos')}
            >
              {status?.photos ? 'Открыто' : 'Закрыто'}
            </button>
          </div>
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
