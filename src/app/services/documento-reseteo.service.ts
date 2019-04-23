import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';
import { Rest } from  '../resources/rest.resource';
import { GLOBAL } from '../global';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/documentoReseteos'
})
export class DocumentoReseteoService extends Rest {
    @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
		path: '/consultaMultiple'
	})  	
	consultaMultiple: ResourceMethod<{},any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
		path: '/consultarCodigoBarras'
	})  	
	consultarCodigoBarras: ResourceMethod<{},any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
		path: '/registrarCabecera'
	})  	
	registrarCabecera: ResourceMethod<{},any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
		path: '/registrarDetalle'
	})  	
	registrarDetalle: ResourceMethod<{},any>;
}