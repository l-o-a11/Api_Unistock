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
  sedeTransfers() {
    if (!this._sedeTransfers) this._sedeTransfers = [];
    return this._sedeTransfers;
  },
  purchases() {
    if (!this._purchases) this._purchases = [];
    return this._purchases;
  },
  detallePurchases() {
    if (!this._detallePurchases) this._detallePurchases = [];
    return this._detallePurchases;
  },
  insumos() {
    if (!this._insumos) this._insumos = [];
    return this._insumos;
  },
  roles() {
    if (!this._roles) this._roles = [];
    return this._roles;
  },
  sites() {
    if (!this._sites) this._sites = [];
    return this._sites;
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

const mongoose = require("mongoose");


const connectDatabase = async () => {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DATABASE_NAME || "unistock";

  await mongoose.connect(uri, { dbName });
  console.log(` MongoDB conectado → ${dbName}`);
};

module.exports = { connectDatabase };
