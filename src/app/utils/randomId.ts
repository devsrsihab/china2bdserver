export function generateRandomId(): string {
  const min: number = 100000; // Minimum 10-digit number
  const max: number = 999999; // Maximum 10-digit number
  const fixedVal:number = 2030; // fixed values
  const randomId: number = Math.floor(Math.random() * (max - min + 1)) + min;
  return fixedVal + randomId.toString();
}
