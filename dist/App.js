"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chalk_1 = __importDefault(require("chalk"));
class App {
    constructor({ config, db, router, services } = {}) {
        this._app = null;
        this._server = null;
        this.config = null;
        this.db = null;
        this._router = null;
        this._services = [];
        this._instances = {
            controllers: [],
            services: {}
        };
        this._hooks = {
            prepare: () => { },
            beforeStart: () => { },
            afterStart: () => { },
            beforeClose: () => { }
        };
        this._app = express_1.default();
        if (config) {
            this.setConfig(config);
        }
        if (db) {
            this.setDatabase(db);
        }
        if (router) {
            this.setRouter(router);
        }
        if (services) {
            this.setServices(services);
        }
    }
    setConfig(config) {
        this.config = config;
    }
    setDatabase(db) {
        this.db = db;
    }
    setRouter(router) {
        this._router = router;
    }
    setServices(services) {
        this._services = services;
    }
    instantiateControllers() {
        const controllers = this._router.getControllers();
        controllers.forEach(Controller => {
            Controller.prototype.$app = this;
            const controller = new Controller();
            this._instances.controllers.push(controller);
        });
    }
    mountControllers() {
        this._instances.controllers.forEach(controller => {
            const basePath = controller.getBasePath();
            this._app.use(basePath, controller.getController());
        });
        const { generalErrorHandler = (err, req, res, next) => {
            console.error(err);
            res.status(500).end();
        } } = this._router.getErrorHandlers();
        this._app.use(generalErrorHandler);
    }
    instantiateServices() {
        Object.entries(this._services).forEach(([name, Service]) => {
            Service.prototype.$app = this;
            const service = new Service();
            this._instances.services[name] = service;
        });
    }
    prepare(fn) {
        this._hooks.prepare = fn;
    }
    beforeStart(fn) {
        this._hooks.beforeStart = fn;
    }
    afterStart(fn) {
        this._hooks.afterStart = fn;
    }
    beforeClose(fn) {
        this._hooks.beforeClose = fn;
    }
    get prepareCtx() {
        let middlewares = null;
        let errorHandlers = null;
        if (this._router) {
            middlewares = this._router.getMiddlewares();
            errorHandlers = this._router.getErrorHandlers();
        }
        return [this._app, middlewares, errorHandlers];
    }
    get ctx() {
        return {
            _app: this._app,
            _server: this._server,
            config: this.config,
            services: this._instances.services,
            db: this.db
        };
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config) {
                throw new Error('Config is missing. Please provide it by calling setConfig(yourConfig) on your app!');
            }
            yield this._hooks.prepare(...this.prepareCtx);
            if (this.db) {
                this.db.injectApp(this);
            }
            if (this._router) {
                this.instantiateControllers();
                this.mountControllers();
            }
            if (Object.keys(this._services).length) {
                this.instantiateServices();
            }
            yield this._hooks.beforeStart(this.ctx);
            const PORT = process.env.PORT || this.config.PORT;
            this._server = this._app.listen(PORT, () => {
                console.log(chalk_1.default `{blue API running on }{cyan.underline http://localhost:${PORT}}`);
                this._hooks.afterStart(this.ctx);
            });
        });
    }
    close() {
        if (this._server === null) {
            console.log(chalk_1.default `{yellow Can not close a not started server}`);
            return;
        }
        this._hooks.beforeClose(this.ctx);
        this._instances.controllers = [];
        Object.values(this._instances.services).forEach(service => service.stop());
        this._server.close();
    }
    getApp() {
        return this._app;
    }
}
exports.default = App;
process.on('uncaughtException', (err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=App.js.map