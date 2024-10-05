import { ExecTime } from '../scenes/common-enums.scenes/time-limit.enum';

export enum ExecutionTime {
  LongTerm = 'lg',
  MediumTerm = 'md',
  Urgent = 'ur',
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
