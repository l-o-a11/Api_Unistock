const normalize = (value) => String(value).trim().toLowerCase();

const validatePermissions = (permisos = [], moduloRepository, privilegioRepository) => {
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

  // Obtener módulos y privilegios válidos de BD
  const modulosValidos = moduloRepository.findAll();
  const privilegiosValidos = privilegioRepository.findAll();

  const isValidModulo = (modulo) => 
    modulosValidos.some(m => normalize(m.nombre) === normalize(modulo));
  
  const isValidPrivilegio = (privilegio) => 
    privilegiosValidos.some(p => normalize(p.nombre) === normalize(privilegio));

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

    const moduloNormalized = normalize(modulo);
    if (!isValidModulo(moduloNormalized)) {
      const error = new Error(`Módulo inválido: ${modulo}`);
      error.statusCode = 422;
      throw error;
    }

    if (seenModules.has(moduloNormalized)) {
      const error = new Error(`El módulo '${moduloNormalized}' está repetido en los permisos`);
      error.statusCode = 422;
      throw error;
    }
    seenModules.add(moduloNormalized);

    if (!Array.isArray(privilegios) || privilegios.length === 0) {
      const error = new Error(`El módulo '${moduloNormalized}' debe contener un arreglo no vacío de privilegios`);
      error.statusCode = 422;
      throw error;
    }

    const privilegiosNormalized = privilegios.map((privilegio) => {
      const valor = normalize(privilegio);
      if (!isValidPrivilegio(valor)) {
        const error = new Error(`Privilegio inválido en módulo '${moduloNormalized}': ${privilegio}`);
        error.statusCode = 422;
        throw error;
      }
      return valor;
    });

    const uniquePrivilegios = [...new Set(privilegiosNormalized)];

    return {
      modulo: moduloNormalized,
      privilegios: uniquePrivilegios,
    };
  });
};

module.exports = {
  validatePermissions,
};

module.exports = {
    validatePermissions,
};
