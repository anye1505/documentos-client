
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';

import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';



@Injectable()
@ResourceParams({
  url:GLOBAL.url
})


export class UbigeoService extends Rest{

	@ResourceAction({
		method: RequestMethod.Get,
		path: '/ubigeos',
		auth: true,
		isArray: true
	})    
	find: ResourceMethod<any, any>;


	@ResourceAction({
		method: RequestMethod.Get,		
		path: '/ubigeos/count',
		auth: true
	})    
	count: ResourceMethod<any, {count:number}>;

}
