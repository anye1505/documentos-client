import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';
import { Rest } from  '../resources/rest.resource';
import { GLOBAL } from '../global';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/tipoReseteos'
})
export class TipoReseteoService extends Rest {
    @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
		path: '/lista'
	})  	
	lista: ResourceMethod<{},any>;
}