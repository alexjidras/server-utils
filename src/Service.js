export default class Service {
    $services = {};
    
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