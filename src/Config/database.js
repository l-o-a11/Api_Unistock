// Config/database.js
// En memoria para desarrollo. Migrar a MongoDB en producci�n.

const store = {
  users() {
    if (!this._users) {
      this._users = [
        {
        },
      ];
    }
    return this._users;
  },

  productCategory(){
    if (!this._productCategory) {
      this._productCategory = [];
    }
    return this._productCategory;
  },

  products(){
    if (!this._products) {
      this._products = [];
    }
    return this._products;
  },

  technicalSpecifications() {
    if (!this._technicalSpecifications) {
      this._technicalSpecifications = [];
    }
    return this._technicalSpecifications;
  },

  materialstechnicalSpecifications() {
    if (!this._materialstechnicalSpecifications) {
      this._materialstechnicalSpecifications = [];
    }
    return this._materialstechnicalSpecifications;
  },

  suppliers() {
    if (!this._suppliers) {
      this._suppliers = [];
    }
    return this._suppliers;
  },

  thirdParties() {
    if (!this._thirdParties) {
      this._thirdParties = [];
    }
    return this._thirdParties;
  },

  production() {
    if (!this._production) {
      this._production = [];
    }
    return this._production;
  },

  productionOrderDetails() {
    if (!this._productionOrderDetails) {
      this._productionOrderDetails = [];
    }
    return this._productionOrderDetails;
  },

  thirdPartyAssignments() {
    if (!this._thirdPartyAssignments) {
      this._thirdPartyAssignments = [];
    }
    return this._thirdPartyAssignments;
  },

  productionStates() {
    if (!this._productionStates) {
      this._productionStates = [];
    }
    return this._productionStates;
  },

  stateChanges() {
    if (!this._stateChanges) {
      this._stateChanges = [];
    }
    return this._stateChanges;
  },

  orderProcesses() {
    if (!this._orderProcesses) {
      this._orderProcesses = [];
    }
    return this._orderProcesses;
  },

  headquarterTransfers() {
    if (!this._headquarterTransfers) {
      this._headquarterTransfers = [];
    }
    return this._headquarterTransfers;
  },
};

const connectDatabase = async () => {
  // Simulated connection
  console.log("Connected to in-memory store");
  return Promise.resolve();
};

module.exports = {
  store,
  connectDatabase,
};
