import assert from "node:assert/strict";
import test from "node:test";
import {
  decryptAtRest,
  encryptAtRest,
  isEncryptedValue,
} from "./encryption.server.js";

const ENV = {
  DATA_ENCRYPTION_KEY: "test-data-encryption-key-material-2026",
};

test("encryptAtRest/decryptAtRest round-trips plaintext", async () => {
  const plaintext = JSON.stringify([{ text: "This is sensitive task content" }]);

  const encrypted = await encryptAtRest(plaintext, ENV);
  assert.notEqual(encrypted, plaintext);
  assert.equal(isEncryptedValue(encrypted), true);

  const decrypted = await decryptAtRest(encrypted, ENV);
  assert.equal(decrypted, plaintext);
});

test("encryptAtRest uses random IV for each encryption", async () => {
  const plaintext = "same-input";
  const one = await encryptAtRest(plaintext, ENV);
  const two = await encryptAtRest(plaintext, ENV);

  assert.notEqual(one, two);
});

test("decryptAtRest passes through legacy plaintext", async () => {
  const plaintext = JSON.stringify([{ text: "legacy unencrypted row" }]);
  const decrypted = await decryptAtRest(plaintext, ENV);
  assert.equal(decrypted, plaintext);
});

test("decryptAtRest rejects malformed encrypted payload", async () => {
  await assert.rejects(() => decryptAtRest("enc:v1:broken", ENV));
  await assert.rejects(() => decryptAtRest("enc:v1:AA==:AA==", ENV));
});
