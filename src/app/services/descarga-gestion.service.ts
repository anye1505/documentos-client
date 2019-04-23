import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';
import { Rest } from  '../resources/rest.resource';
import { GLOBAL } from '../global';
import { DescargaGestion } from '../models/gestion';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/gestiones'
})
export class DescargaGestionService extends Rest{
    @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
		isArray: true,
		path: '/motivo'
	})  	
	motivo: ResourceMethod<{},any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
		isArray: true,
		path: '/motivoid'
	})  	
    motivoid: ResourceMethod<{},any>;
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/descargardocumentos'
	})  	
	descargardocumentos: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/descargaValidar'
	})  	
	descargaValidar: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/descargaValidarMultiple'
	})  	
	descargaValidarMultiple: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/reporte/reporte_mensajero'
	})  	
	reportemensajero: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/reporte/reporte_mensajero_control'
	})  	
	reportemensajerocontrol: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/reporte/reporte_cliente_proceso'
	})  	
	reporteclienteproceso: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
		isArray: true,
		path: '/couriers'
	})  	
	couriers: ResourceMethod<{},any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
		isArray: true,
		path: '/productos'
	})  	
	productos: ResourceMethod<{},any>;
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/reporte/reporte_mensajero_pendiente'
	})  	
	reportemensajeropendiente: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        path: '/reporte/exportar_excel_mensajero'
	})  	
	exportar: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/reporte/reporte_agente_control'
	})  	
	reporteagentecontrol: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/reporte/reporte_agente_pendiente'
	})  	
	reporteagentependiente: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        path: '/reporte/exportar_excel_mensajero_detallado'
	})  	
	exportardetallado: ResourceMethod<{}, any>;
}