export interface Question {
  id: number;
  question: string;
  answer: string;
}

export type MachineState = 'IDLE' | 'SHUFFLING' | 'DROPPING' | 'WAITING_TO_OPEN' | 'REVEALED';

export interface CapsuleColor {
  bg: string;
  dark: string;
}