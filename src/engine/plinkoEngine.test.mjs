import assert from 'node:assert/strict';
import test from 'node:test';
import { canAffordDrop, DROP_BET } from './plinkoEngine.ts';

test('allows a second drop when the first wager left enough wallet balance', () => {
  const startingBalance = 2;
  const balanceAfterFirstDrop = startingBalance - DROP_BET;

  assert.equal(canAffordDrop(startingBalance), true);
  assert.equal(canAffordDrop(balanceAfterFirstDrop), true);
  assert.equal(canAffordDrop(balanceAfterFirstDrop - DROP_BET), false);
});
