
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';

import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';

import { Role } from  '../models/role';


@Injectable()
@ResourceParams({
 	url:GLOBAL.url
})


export class ClienteService extends Rest{
	
	@ResourceAction({
	    method: RequestMethod.Post,
	    path: '/clientes/crear',
	    auth: true
	})  	
  	create: ResourceMethod<any, any>;

	@ResourceAction({
	    method: RequestMethod.Get,
	    path: '/clientes',
	    auth: true,
	    isArray: true
	})  	
  	query: ResourceMethod<any, any>;
	
	@ResourceAction({
	    method: RequestMethod.Get,
	    path: '/clientes/count',
	    auth: true
	})  	
	  count: ResourceMethod<any, {count:number}>;
	  
	 @ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        path: '/clientes/exportarexcel'
	})  	
	exportarexcel: ResourceMethod<{}, any>;

}
