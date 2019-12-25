import express from 'express';
import chalk from 'chalk';
export default class App {
    _app = null;
    _server = null;
    config = null;
    db = null;
    _router = null;
    _services = [];
    _instances = {
        controllers: [],
        services: {}
    };
    _hooks = {
        prepare: () => {},
        beforeStart: () => {},
        afterStart: () => {},
        beforeClose: () => {}
    };

    constructor({ config, db, router, services} = {}) {
        this._app = express();
        if(config) {
            this.setConfig(config);
        }
        if(db) {
            this.setDatabase(db);
        }
        if(router) {
            this.setRouter(router);
        }
        if(services) {
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
        const {
            generalErrorHandler = (err, req, res, next) => {
                console.error(err);
                res.status(500).end();
            } 
        } = this._router.getErrorHandlers();
        this._app.use(generalErrorHandler);
    }
    instantiateServices() {
        Object.entries(this._services).forEach(([name, Service]) => {
            Service.prototype.$app = this;
            const service = new Service();
            this._instances.services[name] = service;
        })
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
        if(this._router) {
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
        }
    }
    
    async start() {
        if(!this.config) {
            throw new Error('Config is missing. Please provide it by calling setConfig(yourConfig) on your app!');
        }
        await this._hooks.prepare(...this.prepareCtx);
        if(this.db) {
            this.db.injectApp(this);
        }
        if(this._router) {
            this.instantiateControllers();
            this.mountControllers();
        }
        if(Object.keys(this._services).length) {
            this.instantiateServices();
        }

        await this._hooks.beforeStart(this.ctx);

        const PORT = process.env.PORT || this.config.PORT; 
        this._server = this._app.listen(PORT, () => {
            console.log(chalk`{blue API running on }{cyan.underline http://localhost:${PORT}}`)
            this._hooks.afterStart(this.ctx);
        });
    }

    close() {
        if(this._server === null ) {
            console.log(chalk`{yellow Can not close a not started server}`);
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

process.on('uncaughtException', (err) => {
    console.error(err);
    process.exit(1);
})