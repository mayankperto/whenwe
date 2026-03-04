export interface EventSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  votes: VoteRecord[];
}

export interface VoteRecord {
  id: string;
  participantName: string;
  available: boolean;
}

export interface EventData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  createdAt: string;
  slots: EventSlot[];
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  slots: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface VotePayload {
  participantName: string;
  votes: {
    slotId: string;
    available: boolean;
  }[];
}

export interface SlotWithVoteCount extends EventSlot {
  voteCount: number;
  isWinner: boolean;
}
