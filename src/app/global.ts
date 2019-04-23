var env = process.env.NODE_ENV || 'local';

var configGlobal = {
    local:{
        url: 'http://localhost:3000/api/',
        url2: 'http://localhost:3000',
        realm:'sau',
        ttl: 86400,
        checkInterval: 15000,
        segundos_autologout: 86400
    },
    dev:{
        url: 'http://74.208.177.97/api/',
        url2: 'http://74.208.177.97',
        realm: 'sau',
        ttl: 86400,
        checkInterval: 15000,
        segundos_autologout: 86400
    },
    prod:{
        url: 'https://documentos.pe/api/',
        url2: 'https://documentos.pe',
        realm: 'sau',
        ttl: 86400,
        checkInterval: 15000,
        segundos_autologout: 86400
    }
}


export var GLOBAL = configGlobal[env]