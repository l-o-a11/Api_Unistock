const test = require('node:test');
const assert = require('node:assert/strict');
const ForgotPassword = require('../../src/application/use-cases/auth/ForgotPassword');

test('lanza error cuando el correo no está registrado', async () => {
  const repo = {
    findByEmail: async () => null,
  };

  const useCase = new ForgotPassword(repo);

  await assert.rejects(
    () => useCase.execute({ correo: 'noexiste@test.com' }),
    (err) => {
      assert.equal(err.statusCode, 404);
      assert.match(err.message, /No existe/i);
      return true;
    },
  );
});
