# 🤝 Guía de Contribución

## Bienvenido a Unistock 👋

¡Gracias por tu interés en contribuir! Este documento te guiará en el proceso.

---

## 📋 Antes de Comenzar

1. **Fork** el repositorio
2. **Clonar** tu fork localmente
3. **Crear** una rama para tu feature: `git checkout -b feature/descripcion`
4. **Hacer** tus cambios
5. **Commit**: `git commit -am 'Descripción clara del cambio'`
6. **Push**: `git push origin feature/descripcion`
7. **Pull Request**: Abre un PR hacia `main` o `dev`

---

## 📝 Commits

Usa **Conventional Commits**:

```
feat: Agregar nuevo endpoint de X
fix: Corregir bug en Y
docs: Actualizar documentación de Z
refactor: Mejorar estructura de A
test: Agregar tests para B
chore: Actualizar dependencias
```

---

## 🎯 Estándares de Código

### Nombres

```javascript
// ✅ Bien
const getUserById = (id) => {};
const SupplierRepository = class {};

// ❌ Mal
const get_user_by_id = (id) => {};
const supplierrepository = class {};
```

### Documentación

```javascript
/**
 * Descripción breve del método
 * @param {type} paramName - Descripción del parámetro
 * @returns {type} Descripción del retorno
 */
const myMethod = (paramName) => {
  // Implementación
};
```

### Archivo Structure

- Imports al inicio
- Constantes después
- Funciones/Clases
- Exports al final

---

## 🧪 Testing

```bash
npm test                  # Ejecutar todos los tests
npm run test:watch      # Watch mode
```

---

## 🐛 Reportar Bugs

1. Busca si ya existe el issue
2. Si no, crea uno con:
   - Título claro
   - Descripción detallada
   - Pasos para reproducir
   - Resultado esperado vs actual
   - Screenshots si aplica

---

## 💡 Sugerir Features

1. Crea un issue con etiqueta `enhancement`
2. Describe:
   - Qué problema resuelve
   - Por qué es necesario
   - Posible implementación (opcional)

---

## 🔍 Proceso de Review

- ✅ Verificamos:
  - Código limpio y legible
  - Sigue convenciones
  - Tests pasan
  - Documentación actualizada

- ⏳ Tiempo de respuesta: 2-3 días

---

## 📦 Agregar Dependencias

```bash
# Desarrollo
npm install --save-dev nombre-paquete

# Producción
npm install nombre-paquete
```

Justifica el uso en tu PR.

---

## 🚀 Deploy

- `main` → Producción
- `dev` → Staging
- Feature branches → Testing

---

## 📞 Preguntas

- 📧 Email: team@unistock.dev
- 💬 Discussions en GitHub
- 🐛 Issues con etiqueta `question`

---

## 📜 Licencia

Al contribuir, aceptas que tu código se licencia bajo MIT.

---

**¡Gracias por contribuir! 🎉**
