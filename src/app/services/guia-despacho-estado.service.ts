import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';
import { Rest } from  '../resources/rest.resource';
import { GLOBAL } from '../global';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/guiaDespachoEstados'
})
export class GuiaDespachoEstadoService extends Rest{
    @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true
	})  	
	find: ResourceMethod<{},any>;
}