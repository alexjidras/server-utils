"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Service {
    constructor() {
        this.$services = {};
    }
    get $config() {
        return this.$app.config;
    }
    get $services() {
        return this.$app._instances.services;
    }
    get $db() {
        return this.$app.db;
    }
}
exports.default = Service;
//# sourceMappingURL=Service.js.map