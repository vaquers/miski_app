import { requestJsonWithApiFallback } from './apiBase';

export type VotingNomination = 'defile' | 'photos';

export type ParticipantDto = {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  order?: number;
  previewImage?: string;
};

export type VoteRequest = {
  tg_id: number;
  participant_id: string;
  nomination: VotingNomination;
};

export async function getParticipants(): Promise<ParticipantDto[]> {
  return await requestJsonWithApiFallback<ParticipantDto[]>('/participants');
}

export async function hasVoted(tgId: number): Promise<unknown> {
  return await requestJsonWithApiFallback(`/has-voted/${tgId}`);
}

export async function vote(req: VoteRequest): Promise<unknown> {
  // Бэкенд может ожидать другие имена полей; отправим совместимый payload.
  const payload = {
    ...req,
    tgId: req.tg_id,
    participantId: req.participant_id,
    participant_id: req.participant_id,
    stage: req.nomination,
    category: req.nomination,
  };

  return await requestJsonWithApiFallback('/vote', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getResults(): Promise<unknown> {
  return await requestJsonWithApiFallback('/results');
}

export async function getVoters(): Promise<unknown> {
  return await requestJsonWithApiFallback('/voters');
}

