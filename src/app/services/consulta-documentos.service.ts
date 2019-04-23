import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';
import { Rest } from  '../resources/rest.resource';
import { GLOBAL } from '../global';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/consultadocumentos'
})
export class ConsultaDocumentosService extends Rest{
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
		isArray: true,
		path: '/buscar'
	})  	
	buscar: ResourceMethod<{},any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
		isArray: true,
		path: '/detalle'
	})  	
	detalle: ResourceMethod<{},any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
		isArray: true,
		path: '/porDestinatario'
	})  	
	porDestinatario: ResourceMethod<{},any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
		isArray: true,
		path: '/buscar_basico'
	})  	
	buscarbasico: ResourceMethod<{},any>;
}