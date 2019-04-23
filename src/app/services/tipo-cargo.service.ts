
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';

import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';



@Injectable()
@ResourceParams({
  url:GLOBAL.url
})


export class TipoCargoService extends Rest{

	@ResourceAction({
		method: RequestMethod.Get,
		path: '/tipoCargos',
		auth: true,
		isArray: true
	})    
	query: ResourceMethod<any, any>;


	@ResourceAction({
		method: RequestMethod.Get,		
		path: '/tipoCargos/count',
		auth: true
	})    
	count: ResourceMethod<any, {count:number}>;

}
