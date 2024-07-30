import { generateUniqueId } from './uniq-id.helper';

export function onChequeUniqueId(arr: string[], uniqueId: string) {
  if (!uniqueId) {
    uniqueId = generateUniqueId();
    arr.push(uniqueId);
    return;
  } else {
    const elementIndex = arr.indexOf(uniqueId);
    if (elementIndex === -1) {
      uniqueId = generateUniqueId();
      arr.push(uniqueId);
      return;
    } else {
      arr.splice(elementIndex, 1);
      uniqueId = generateUniqueId();
      arr.push(uniqueId);
      return;
    }
  }
}
