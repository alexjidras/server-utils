import chalk from 'chalk';

export const wrapDb = (db) => class extends (typeof db === 'object' ? db.constructor : db) {
    $app = null;
    constructor(connector) {
        super();
        if(connector) {
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
        console.log(chalk`{yellow Database disconnected}`);
    }

    startConnection() {
        if(!this._connect) {
            console.error(chalk`{red Connector missing'}`);
            return;
        }
        return this._connect(this, this.$app.config).then(() => {
            console.log(chalk`{green Database connection succesfully established}`);
        });
    }
}
