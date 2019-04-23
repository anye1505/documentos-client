
const Home = {
    text: 'Inicio',
    link: '/home',
    icon: 'icon-home'
};

const Usuario = {
    text: 'Usuario',
    link: '/user',
    icon: 'icon-user',
    submenu: [
        {
            text: 'Crear Usuario',
            link: '/user/create',
            roles:['admin','administrador']
        },
        {
            text: 'Lista',
            link: '/user/list',
            roles:['admin','administrador']
        }
    ],
    roles:['admin','administrador']
};

const configuracion = {
    text: 'Configuración',
    link: '/procesamiento',
    icon: 'icon-grid',
    submenu: [
        {
            text: 'Mi consumo',
            link: '/procesamiento/consumo',
            roles:['admin','administrador']
        },        
        {
            text: 'Clientes',
            link: '/mantenimiento/cliente',
            roles:['admin','administrador','produccion','ejecutivo']
        },        
        {
            text: 'Reglas distribución',
            link: '/mantenimiento/reglaDistribucion',
            roles:['admin','administrador','produccion','ejecutivo']
        },        
        {
            text: 'Mensajeros',
            link: '/mensajero/list',
            roles:['admin','administrador','jefe_distribucion']
        },        
        {
            text: 'Agentes',
            link: '/mantenimiento/agentes',
            roles:['admin','administrador','jefe_distribucion']
        }
		
    ],
    roles:['admin','administrador','produccion','ejecutivo','jefe_distribucion']
};

const procesamiento = {
    text: 'Producción',
    link: '/procesamiento',
    icon: 'icon-social-dropbox',
    submenu: [	     
        {
            text: 'Carga de bases',
            link: '/distribucion/base-prioritario',
            roles:['admin']
        },
		{
            text: 'Ordenamiento',
            link: '/procesamiento/orden',
            roles:['admin','administrador','produccion','ejecutivo']
        },   
        {
            text: 'Orden de servicio',
            link: '/procesamiento/servicio',
            roles:['admin','administrador','produccion','ejecutivo']
        },
        {
            text: 'Recuperación de cargos',
            link: '/procesamiento/cargo',
            roles:['admin','administrador','produccion','ejecutivo']
        }
    ],
    roles:['admin','administrador','produccion','ejecutivo']
};

const distribucion = {
    text: 'Distribución',
    link: '/distribucion',
    icon: 'icon-envelope',
    submenu: [
        {
            text: 'Despachos',
            link: '/distribucion/despachos',
            roles:['admin','administrador','distribucion','jefe_distribucion']
        }, 
        {
            text: 'Recepción',
            link: '/distribucion/recepcion',
            roles:['admin','administrador','consultas','distribucion','agente','jefe_distribucion']
        },        
        {
            text: 'Asignación de documentos',
            link: '/distribucion/asignaciondocumentos',
            roles:['admin','administrador','distribucion','jefe_distribucion']
        },        
        {
            text: 'Reseteo de documentos',
            link: '/distribucion/reseteolista',
            roles:['admin','administrador','distribucion','jefe_distribucion']
        },        
        {
            text: 'Asignación de no clasificados',
            link: '/distribucion/noclasificadolista',
            roles:['admin','administrador','distribucion','jefe_distribucion']
        },
        {
            text: 'Descarga de gestión',
            link: '/distribucion/descargagestion',
            roles:['admin','administrador','distribucion','agente','jefe_distribucion','produccion']
        },
        {
            text: 'Consulta de documentos',
            link: '/distribucion/consultadocumentos',
            roles:['admin','administrador','produccion','distribucion','ejecutivo','agente','jefe_distribucion','digitalizador','cliente']
        },
        {
            text: 'Gestión de clientes',
            link: '/distribucion/gestionclientes',
            roles:['admin','administrador','ejecutivo']
        },
        {
            text: 'Gestión de distribución',
            link: '/distribucion/gestiondistribucion',
            roles:['admin','administrador','distribucion','jefe_distribucion']
        },
        {
            text: 'Gestión de agentes',
            link: '/distribucion/gestionagentes',
            roles:['admin','administrador','distribucion','jefe_distribucion']
        }
    ],
    roles:['admin','administrador','consultas','ejecutivo','distribucion','agente','jefe_distribucion','produccion','digitalizador']
};

const estadisticas = {
    text: 'Clientes',
    link: '/estadisticas',
    icon: 'icon-graph',
    submenu: [
        {
            text: 'Proceso',
            link: '/estadisticas/proceso',
            roles:['admin','cliente']
        }
    ],
    roles:['admin','cliente']
};

const reporte = {
    text: 'Descargas',
    link: '/reporte',
    icon: 'icon-cloud-download',
    submenu: [
        {
            text: 'Bandeja',
            link: '/reporte/tarea',
            roles:['admin','administrador','produccion','ejecutivo','distribucion','jefe_distribucion','agente','cliente']
        },
        {
            text: 'Datos de cierre',
            link: '/reporte/datos-cierre',
            roles:['admin','administrador']
        }
    ],
    roles:['admin','administrador','produccion','ejecutivo','distribucion','agente']
};

const headingMain = {
    text: 'Menú',
    heading: true
};

export const menu = [    
    Home,
    Usuario,
    configuracion,
    procesamiento,
    distribucion,
    estadisticas,
    reporte
    
];
