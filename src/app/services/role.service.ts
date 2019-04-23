
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


export class RoleService extends Rest{
	
	@ResourceAction({
	    method: RequestMethod.Get,
	    path: '/roles',
	    auth: true,
	    isArray: true
	})  	
  	query: ResourceMethod<{}, Role[]>;

}
