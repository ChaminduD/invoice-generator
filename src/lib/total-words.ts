import { toWords } from "n2words/en";

function toTitleCase(s: string) {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function totalToWordsRs(total: number) {
  const n = Math.max(0, Math.floor(total));
  const words = toTitleCase(toWords(n));
  return `${words} Rupees Only.`;
}