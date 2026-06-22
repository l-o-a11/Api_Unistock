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

let dbReady = false;

const connectDatabase = async () => {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DATABASE_NAME || "unistock";

  if (!uri) {
    throw new Error("Missing env var MONGO_URI");
  }

  // Fail-fast configuration to avoid 10s buffering timeouts
  // when the app receives requests before the connection is ready.
  mongoose.set("bufferCommands", false);

  // Note: option names may differ slightly between mongoose versions.
  // These are widely supported by the underlying MongoDB driver.
  const conn = await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 5_000,
    socketTimeoutMS: 30_000,
    // connectTimeoutMS is supported by the native driver
    connectTimeoutMS: 10_000,
  });

  dbReady = !!conn?.connections?.length ? true : true;
  console.log(`MongoDB conectado → ${dbName}`);
  return conn;
};

const isDbConnected = () => {
  return mongoose.connection.readyState === 1 && dbReady;
};

module.exports = { connectDatabase, isDbConnected };
