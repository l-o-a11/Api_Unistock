/**
 * rolePermissionValidator.js
 *
 * Valida el array de permisos que se envía al crear o actualizar un rol.
 * Cada permiso tiene la forma: { modulo: string, privilegios: string[] }
 *
 * Acepta tanto el nombre del módulo/privilegio como su ID de MongoDB,
 * y siempre normaliza a nombre en minúsculas en el resultado.
 */

const normalize = (value) => String(value).trim().toLowerCase();

const validatePermissions = async (permisos = [], moduleRepository, privilegeRepository) => {
  if (!Array.isArray(permisos)) {
    const error = new Error("Los permisos deben enviarse como un arreglo");
    error.statusCode = 422;
    throw error;
  }

  if (permisos.length === 0) {
    const error = new Error("Debe seleccionar al menos un módulo con privilegios");
    error.statusCode = 422;
    throw error;
  }

  // Cargar catálogos completos una sola vez
  const validModules    = await moduleRepository.findAll();
  const validPrivileges = await privilegeRepository.findAll();

  const resolveModule = (value) => {
    const norm = normalize(value);
    const byName = validModules.find((m) => normalize(m.nombre) === norm);
    if (byName) return normalize(byName.nombre);
    const byId = validModules.find((m) => m.id === value || normalize(m.id) === norm);
    return byId ? normalize(byId.nombre) : null;
  };

  const resolvePrivilege = (value) => {
    const norm = normalize(value);
    const byName = validPrivileges.find((p) => normalize(p.nombre) === norm);
    if (byName) return normalize(byName.nombre);
    const byId = validPrivileges.find((p) => p.id === value || normalize(p.id) === norm);
    return byId ? normalize(byId.nombre) : null;
  };

  const seenModules = new Set();

  return permisos.map((permiso, index) => {
    if (!permiso || typeof permiso !== "object" || Array.isArray(permiso)) {
      const error = new Error(`El permiso en la posición ${index} debe ser un objeto`);
      error.statusCode = 422;
      throw error;
    }

    const { modulo, privilegios } = permiso;

    if (!modulo) {
      const error = new Error(`El permiso en la posición ${index} debe incluir el campo 'modulo'`);
      error.statusCode = 422;
      throw error;
    }
    if (!privilegios) {
      const error = new Error(`El permiso en la posición ${index} debe incluir el campo 'privilegios'`);
      error.statusCode = 422;
      throw error;
    }

    const moduloResuelto = resolveModule(modulo);
    if (!moduloResuelto) {
      const error = new Error(`Módulo inválido: '${modulo}'. Módulos disponibles: ${validModules.map(m => m.nombre).join(", ")}`);
      error.statusCode = 422;
      throw error;
    }

    if (seenModules.has(moduloResuelto)) {
      const error = new Error(`El módulo '${moduloResuelto}' está repetido en los permisos`);
      error.statusCode = 422;
      throw error;
    }
    seenModules.add(moduloResuelto);

    if (!Array.isArray(privilegios) || privilegios.length === 0) {
      const error = new Error(`El módulo '${moduloResuelto}' debe contener un arreglo no vacío de privilegios`);
      error.statusCode = 422;
      throw error;
    }

    const privilegiosResueltos = privilegios.map((privilegio) => {
      const valor = resolvePrivilege(privilegio);
      if (!valor) {
        const error = new Error(
          `Privilegio inválido en módulo '${moduloResuelto}': '${privilegio}'. Privilegios disponibles: ${validPrivileges.map(p => p.nombre).join(", ")}`
        );
        error.statusCode = 422;
        throw error;
      }
      return valor;
    });

    return {
      modulo: moduloResuelto,
      privilegios: [...new Set(privilegiosResueltos)],
    };
  });
};

module.exports = { validatePermissions };