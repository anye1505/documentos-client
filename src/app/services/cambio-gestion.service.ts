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
export class CambioGestionService extends Rest{
	@ResourceAction({
	    method: RequestMethod.Get,
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
	    method: RequestMethod.Post,
	    auth: true,
		isArray: true,
		path: '/actualizargestion'
	})  	
	actualizargestion: ResourceMethod<{},any>;
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
		isArray: true,
		path: '/actualizargestionFile'
	})  	
    actualizargestionFile: ResourceMethod<{},any>;
}