import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';
import { Rest } from  '../resources/rest.resource';
import { GLOBAL } from '../global';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/gestiones'
})
export class GestionClientesService extends Rest{
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/clientes/ordenes'
	})  	
	getordenes: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/clientes/ordenes/cerrar'
	})  	
	cerrar: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/clientes/ordenes/abrir'
	})  	
	abrir: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        path: '/reporte/exportar_excel'
	})  	
	exportar: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        path: '/reporte/exportar_txt'
	})  	
	exportartxt: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        path: '/reporte/exportar_txt1'
	})  	
	exportartxt1: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/clientes/listordenes'
	})  	
	listordenes: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/clientes/ordenes2'
	})  	
	getordenes2: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/clientes/ordeneslista'
	})  	
	getordeneslista: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/clientes/regional'
	})  	
	regional: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/clientes/gestion_entrega'
	})  	
	gestion_entrega: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/clientes/gestion_rezagos'
	})  	
	gestion_rezagos: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/clientes/imagenes'
	})  	
	imagenes: ResourceMethod<{}, any>;
}