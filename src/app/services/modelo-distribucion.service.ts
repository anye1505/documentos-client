
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';

import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';



@Injectable()
@ResourceParams({
  url:GLOBAL.url
})


export class ModeloDistribucionService extends Rest{

	@ResourceAction({
		method: RequestMethod.Get,
		path: '/modeloDistribuciones',
		auth: true,
		isArray: true
	})    
	query: ResourceMethod<any, any>;


	@ResourceAction({
		method: RequestMethod.Get,		
		path: '/modeloDistribuciones/count',
		auth: true
	})    
	count: ResourceMethod<any, {count:number}>;

}
