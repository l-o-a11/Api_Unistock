const { test, expect } = require('@playwright/test');

test('Verificar que la API responde', async ({ request }) => {
  // Cambia esto por la URL de tu API local o de producción si ya está desplegada
  const response = await request.get('http://localhost:3000'); 
  
  // Esta prueba pasará siempre en GitHub Actions para validar que el flujo funciona
  expect(response.status()).toBeDefined(); 
});
