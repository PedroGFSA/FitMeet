export function formatISODateToBr(date: string): string {
  const d = date.split('T')[0];
  const [year, month, day] = d.split('-');
  const time = date.split('T')[1];
  const [hours, minutes] = time.split(':');
  const result = `${day}/${month}/${year} ${hours}:${minutes}`;
  return result;
}
