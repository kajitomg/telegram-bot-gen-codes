export function generateClientId(): string {
  const timestamp = Date.now();
  const randomNumbers = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('');
  return `${timestamp}-${randomNumbers}`;
}