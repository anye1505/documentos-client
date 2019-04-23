
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';


import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';
import { User,UserCreate,UserEdit,UserResetPassword,Login } from  '../models/user';
import { Role,RoleMapping } from  '../models/role';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/procesamiento'
})

export class ProcesamientoService extends Rest{
	/*
	@ResourceAction({
	    method: RequestMethod.Get,
	    path: '/users',
	    auth: true,
	    isArray: true
	})  	
  	query: ResourceMethod<{}, User[]>;

	@ResourceAction({
	    method: RequestMethod.Get,
	    path: '/users/count',
	    auth: true
	})  	
  	count: ResourceMethod<{}, {count:number}>;
  	*/	
}
