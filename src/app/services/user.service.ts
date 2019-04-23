
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';


import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';
import { User,UserCreate,UserEdit,UserResetPassword,Login } from  '../models/user';
import { Role,RoleMapping } from  '../models/role';




interface Identity{	
	created: string;
	id:string;
	ttl:number;
	userId:number;
	userName:string;
	surName:string;
}
@Injectable()
@ResourceParams({
 	url:GLOBAL.url/*,
 	headers:{
 		'Accept': 'application/json',
    	'Content-Type': 'application/json'
 	}*/
})

//crud default
//export class NewRes extends ResourceCRUD<IQueryInput, INewsShort, INews> {}

export class UserService extends Rest{
	
	public identity;
	public token;


	@ResourceAction({
	    method: RequestMethod.Post,
	    path: '/users/login',
	    auth:false,
	    headers:{
 			'Accept': 'application/json',
    		'Content-Type': 'application/json'
	    }
	})
	login:ResourceMethod<Login,Identity>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    path: '/users/logout',
	    auth:true
	    /*headers:{
 			'Accept': 'application/json',
    		'Content-Type': 'application/json',
    		'Authorization':localStorage.getItem('token')
	    }*/
	})
	logout:ResourceMethod<{},{}>;

	@ResourceAction({
	    method: RequestMethod.Get,
	    path: '/users/{!id}',
	    auth: true
	})
	find:ResourceMethod<{id:any},User>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    path: '/users',
	    auth: true
	})
	create:ResourceMethod<UserCreate,User>;


	@ResourceAction({
	    method: RequestMethod.Patch,
	    path: '/users/{!id}',
	    auth: true
	})
	edit:ResourceMethod<UserEdit,User>;


	@ResourceAction({
	    method: RequestMethod.Patch,
	    path: '/users/{!id}',
	    auth: true
	})
	resetPassword:ResourceMethod<UserResetPassword,User>;

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
  	
	
	@ResourceAction({
	    method: RequestMethod.Get,
	    path: '/roleMappings',
	    auth: true,
	    isArray: true
	})  	
  	roles: ResourceMethod<{}, RoleMapping[]>;


	@ResourceAction({
	    method: RequestMethod.Post,
	    path: '/roleMappings',
	    auth: true
	})  	
  	addRole: ResourceMethod<{}, RoleMapping>;


	@ResourceAction({
	    method: RequestMethod.Delete,
	    path: '/roleMappings/{!id}',
	    auth: true
	})  	
	  deleteRole: ResourceMethod<{}, RoleMapping>;
	  
	  @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
	    path: '/users/buscar'
	})  	
	  buscar: ResourceMethod<any, any>;

	  @ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
	    isArray: true,
	    path: '/roleMappings/getroles'
	})  	
	getroles: ResourceMethod<any, any>;
}
