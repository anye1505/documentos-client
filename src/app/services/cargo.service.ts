
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';


import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/cargos'
})

export class CargoService extends Rest{
	

	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true
	})  	
  	query: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Get,
	    path: '/count',
	    auth: true
	})  	
  	count: ResourceMethod<{}, {count:number}>;


	@ResourceAction({
	    method: RequestMethod.Get,
	    path: '/cargos',
	    auth: true
	})  	
  	cargos: ResourceMethod<any,any>;
}
