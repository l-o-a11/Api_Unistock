// Config/database.js
let _nextId = 1;

const store = {
  nextId() {
    return _nextId++;
  },

  users() {
    if (!this._users) this._users = [];
    return this._users;
  },
  suppliers() {
    if (!this._suppliers) this._suppliers = [];
    return this._suppliers;
  },
  thirdParties() {
    if (!this._thirdParties) this._thirdParties = [];
    return this._thirdParties;
  },
  production() {
    if (!this._production) this._production = [];
    return this._production;
  },
  productionOrderDetails() {
    if (!this._productionOrderDetails) this._productionOrderDetails = [];
    return this._productionOrderDetails;
  },
  thirdPartyAssignments() {
    if (!this._thirdPartyAssignments) this._thirdPartyAssignments = [];
    return this._thirdPartyAssignments;
  },
  productionStates() {
    if (!this._productionStates) this._productionStates = [];
    return this._productionStates;
  },
  stateChanges() {
    if (!this._stateChanges) this._stateChanges = [];
    return this._stateChanges;
  },
  orderProcesses() {
    if (!this._orderProcesses) this._orderProcesses = [];
    return this._orderProcesses;
  },
  headquarterTransfers() {
    if (!this._headquarterTransfers) this._headquarterTransfers = [];
    return this._headquarterTransfers;
  },
  compras() {
    if (!this._compras) this._compras = [];
    return this._compras;
  },
  detalleCompras() {
    if (!this._detalleCompras) this._detalleCompras = [];
    return this._detalleCompras;
  },
  insumos() {
    if (!this._insumos) this._insumos = [];
    return this._insumos;
  },
  roles() {
    if (!this._roles) this._roles = [];
    return this._roles;
  },
  sedes() {
    if (!this._sedes) this._sedes = [];
    return this._sedes;
  },
  categoriasInsumos() {
    if (!this._categoriasInsumos) this._categoriasInsumos = [];
    return this._categoriasInsumos;
  },
  modulos() {
    if (!this._modulos) this._modulos = [];
    return this._modulos;
  },
  privilegios() {
    if (!this._privilegios) this._privilegios = [];
    return this._privilegios;
  },
};

const connectDatabase = async () => {
  console.log("Connected to in-memory store");

  // Inicializar módulos por defecto
  const modulos = store.modulos();
  if (modulos.length === 0) {
    const defaultModulos = [
      { id: store.nextId(), nombre: "usuarios", estado: true },
      { id: store.nextId(), nombre: "ventas", estado: true },
      { id: store.nextId(), nombre: "empleados", estado: true },
      { id: store.nextId(), nombre: "roles", estado: true },
      { id: store.nextId(), nombre: "compras", estado: true },
      { id: store.nextId(), nombre: "insumos", estado: true },
      { id: store.nextId(), nombre: "categorias-insumos", estado: true },
      { id: store.nextId(), nombre: "produccion", estado: true },
      { id: store.nextId(), nombre: "proveedores", estado: true },
      { id: store.nextId(), nombre: "terceros", estado: true },
      { id: store.nextId(), nombre: "sedes", estado: true },
      { id: store.nextId(), nombre: "productos", estado: true },
      { id: store.nextId(), nombre: "categorias-productos", estado: true },
    ];
    modulos.push(...defaultModulos);
  }

  // Inicializar privilegios por defecto
  const privilegios = store.privilegios();
  if (privilegios.length === 0) {
    const defaultPrivilegios = [
      { id: store.nextId(), nombre: "crear", estado: true },
      { id: store.nextId(), nombre: "leer", estado: true },
      { id: store.nextId(), nombre: "actualizar", estado: true },
      { id: store.nextId(), nombre: "eliminar", estado: true },
    ];
    privilegios.push(...defaultPrivilegios);
  }
};

module.exports = { store, connectDatabase };