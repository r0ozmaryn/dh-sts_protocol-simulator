// Швидке модульне піднесення до степеня: (base^exp) % mod
// Використовує бінарний алгоритм "квадрат-і-множ" зі складністю O(log exp)
export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  if (mod === 0n) throw new Error("Модуль не може дорівнювати нулю.");
  let result = 1n;
  let b = base % mod;
  let e = exp;

  while (e > 0n) {
    if (e % 2n === 1n) {
      result = (result * b) % mod;
    }
    b = (b * b) % mod;
    e = e / 2n;
  }
  return result;
}

// Розширений алгоритм Евкліда для пошуку мультиплікативно оберненого елемента
// Знаходить таке d, що (a * d) % m === 1
export function modInverse(a: bigint, m: bigint): bigint {
  let m0 = m;
  let y = 0n, x = 1n;

  if (m === 1n) return 0n;

  let tempA = a;
  while (tempA > 1n) {
    if (m0 === 0n) throw new Error("Оберненого елемента не існує (числа не взаємно прості)");
    const q = tempA / m0;
    let t = m0;

    m0 = tempA % m0;
    tempA = t;
    t = y;

    y = x - q * y;
    x = t;
  }

  if (x < 0n) x = x + m;
  return x;
}

// Проста допоміжна функція для псевдогешування рядків у BigInt (імітація SHA)
// Потрібна для генерації дайджесту токенів перед підписом
export function simpleHash(str: string, mod: bigint): bigint {
  let hash = 0n;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31n + BigInt(str.charCodeAt(i))) % mod;
  }
  return hash === 0n ? 1n : hash;
}