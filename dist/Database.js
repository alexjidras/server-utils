"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
exports.wrapDb = (db) => class extends (typeof db === 'object' ? db.constructor : db) {
    constructor(connector) {
        super();
        this.$app = null;
        if (connector) {
            this._connect = connector;
        }
    }
    setConnector(fn) {
        this._connect = fn;
    }
    loadModels(models, fn) {
        models.forEach(model => fn(this, model));
    }
    injectApp(app) {
        this.$app = app;
    }
    stopConnection() {
        super.disconnect();
        console.log(chalk_1.default `{yellow Database disconnected}`);
    }
    startConnection() {
        if (!this._connect) {
            console.error(chalk_1.default `{red Connector missing'}`);
            return;
        }
        return this._connect(this, this.$app.config).then(() => {
            console.log(chalk_1.default `{green Database connection succesfully established}`);
        });
    }
};
//# sourceMappingURL=Database.js.map