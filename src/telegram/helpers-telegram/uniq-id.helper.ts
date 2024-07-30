export function generateUniqueId() {
  const uniqueId =
    'id' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  return uniqueId;
}
