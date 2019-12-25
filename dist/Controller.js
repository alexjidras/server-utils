"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class Controller {
    constructor(basePath = '') {
        this._router = express_1.Router({ mergeParams: true });
        this.basePath = basePath;
    }
    get(...args) {
        this._router.get(...args);
    }
    post(...args) {
        this._router.post(...args);
    }
    patch(...args) {
        this._router.patch(...args);
    }
    put(...args) {
        this._router.put(...args);
    }
    delete(...args) {
        this._router.delete(...args);
    }
    all(...args) {
        this._router.all(...args);
    }
    use(...args) {
        this._router.use(...args);
    }
    getBasePath() {
        return this.basePath;
    }
    get $services() {
        return this.$app._instances.services;
    }
    get $db() {
        return this.$app.db;
    }
    get $middlewares() {
        return this.$app._router.getMiddlewares();
    }
    get $errorHandlers() {
        return this.$app._router.getErrorHandlers();
    }
    getController() {
        return this._router;
    }
}
exports.default = Controller;
//# sourceMappingURL=Controller.js.map