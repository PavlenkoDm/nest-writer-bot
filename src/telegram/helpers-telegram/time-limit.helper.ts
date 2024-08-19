import { ExecTime } from '../scenes/order-scenes/time-limit.scenes';

export enum ExecutionTime {
  LongTerm = 'LongTerm',
  MediumTerm = 'MediumTerm',
  Urgent = 'Urgent',
}

export function onFillTimeLimit(str: ExecutionTime) {
  let timeLimit: string;

  switch (str) {
    case ExecutionTime.LongTerm:
      timeLimit = ExecTime.longTerm;
      break;
    case ExecutionTime.MediumTerm:
      timeLimit = ExecTime.mediumTerm;
      break;
    case ExecutionTime.Urgent:
      timeLimit = ExecTime.urgent;
      break;
    default:
      timeLimit = 'не визначено';
      break;
  }

  return timeLimit;
}
