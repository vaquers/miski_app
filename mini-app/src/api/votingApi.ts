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
  voter?: {
    firstName: string;
    lastName: string;
    profile: string;
    parallel?: '10' | '11' | null;
  };
};

export async function getParticipants(signal?: AbortSignal): Promise<ParticipantDto[]> {
  return await requestJsonWithApiFallback<ParticipantDto[]>('/participants', { signal });
}

export async function hasVoted(tgId: number, signal?: AbortSignal): Promise<unknown> {
  return await requestJsonWithApiFallback(`/has-voted/${tgId}`, { signal });
}

export async function vote(req: VoteRequest): Promise<unknown> {
  const payload = {
    tg_id: req.tg_id,
    tgId: req.tg_id,
    participant_id: req.participant_id,
    participantId: req.participant_id,
    nomination: req.nomination,
    stage: req.nomination,
    category: req.nomination,
    voter: req.voter,
    firstName: req.voter?.firstName,
    lastName: req.voter?.lastName,
    profile: req.voter?.profile,
    parallel: req.voter?.parallel ?? undefined,
    first_name: req.voter?.firstName,
    last_name: req.voter?.lastName,
  };

  return await requestJsonWithApiFallback('/vote', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getResults(signal?: AbortSignal): Promise<unknown> {
  return await requestJsonWithApiFallback('/results', { signal });
}

export async function getVoters(signal?: AbortSignal): Promise<unknown> {
  return await requestJsonWithApiFallback('/voters', { signal });
}
