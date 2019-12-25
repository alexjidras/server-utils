export default class Router {
    constructor({ controllers = [], middlewares = {}, errorHandlers = {} }){
        this.controllers = controllers;
        this.middlewares = middlewares;
        this.errorHandlers = errorHandlers;
    }
    
    getControllers() {
        return this.controllers;
    }
    getMiddlewares() {
        return this.middlewares;
    }
    getErrorHandlers() {
        return this.errorHandlers;
    }
}



