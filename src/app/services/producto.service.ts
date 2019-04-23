
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';

import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';



@Injectable()
@ResourceParams({
  url:GLOBAL.url
})


export class ProductoService extends Rest{

	@ResourceAction({
		method: RequestMethod.Get,
		path: '/productos',
		auth: true,
		isArray: true
	})    
	query: ResourceMethod<any, any>;


	@ResourceAction({
		method: RequestMethod.Get,
		path: '/productos/count',
		auth: true
	})    
	count: ResourceMethod<any, {count:number}>;

	@ResourceAction({
		method: RequestMethod.Post,
		path: '/productos',
		auth: true
	})    
	create: ResourceMethod<any, any>;

	@ResourceAction({
		method: RequestMethod.Post,
		path: '/productos/actualizar',
		auth: true
	})    
	update: ResourceMethod<any, any>;	
}
