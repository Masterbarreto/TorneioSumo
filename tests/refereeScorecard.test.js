import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('RefereeScorecard UI Logic & Rules', () => {
  it('deve validar regra de Melhor de 3 (vitória ao atingir 2 vitórias)', () => {
    const calculateWinner = (s1, s2) => {
      if (s1 >= 2) return 'team-1';
      if (s2 >= 2) return 'team-2';
      return null;
    };
    assert.strictEqual(calculateWinner(1, 0), null);
    assert.strictEqual(calculateWinner(2, 0), 'team-1');
    assert.strictEqual(calculateWinner(1, 2), 'team-2');
  });

  it('deve aplicar desempate pelo tempo de permanência ativa', () => {
    const resolveTie = (t1Active, t2Active) => (t1Active >= t2Active ? 'team-1' : 'team-2');
    assert.strictEqual(resolveTie(25.4, 18.2), 'team-1');
    assert.strictEqual(resolveTie(14.0, 22.1), 'team-2');
  });
});
