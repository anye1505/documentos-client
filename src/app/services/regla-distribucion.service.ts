
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';

import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';



@Injectable()
@ResourceParams({
  url:GLOBAL.url
})


export class ReglaDistribucionService extends Rest{

	@ResourceAction({
		method: RequestMethod.Get,
		path: '/reglaDistribuciones',
		auth: true,
		isArray: true
	})    
	query: ResourceMethod<any, any>;


	@ResourceAction({
		method: RequestMethod.Get,		
		path: '/reglaDistribuciones/count',
		auth: true
	})    
	count: ResourceMethod<any, {count:number}>;



	@ResourceAction({
		method: RequestMethod.Post,		
		path: '/reglaDistribuciones/crear',
		auth: true
	})    
	create: ResourceMethod<any, any>;



	@ResourceAction({
		method: RequestMethod.Post,		
		path: '/reglaDistribuciones/actualizar',
		auth: true
	})    
	update: ResourceMethod<any, any>;


	@ResourceAction({
		method: RequestMethod.Post,		
		path: '/reglaDistribuciones/eliminar',
		auth: true
	})    
	delete: ResourceMethod<any, any>;

}
