
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';

import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';

import { Role } from  '../models/role';


@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/sucursales'
})


export class SucursalService extends Rest{
	
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true
	})  	
  	query: ResourceMethod<any, any>;


	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
	    path: '/buscar'
	})  	
	  buscar: ResourceMethod<any, any>;
	  
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
	    path: '/despachador'
	})  	
	  despachador: ResourceMethod<any, any>;
	
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
	    path: '/sucursales'
	})  	
	  sucursales: ResourceMethod<any, any>;

	  @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
	    path: '/sucursalesRecep'
	})  	
	  sucursalesRecep: ResourceMethod<any, any>;

	  @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
	    path: '/sucursalseleccionada'
	})  	
	  sucursalseleccionada: ResourceMethod<any, any>;

	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
	    path: '/distritos'
	})  	
	  distritos: ResourceMethod<any, any>;
	  @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
	    path: '/cuadrantes'
	})  	
	 cuadrantes: ResourceMethod<any, any>;

	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
	    path: '/transportista'
	})  	
	  transportista: ResourceMethod<any, any>;

	  @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true,
	    path: '/distritosDespacho'
	})  	
	  distritosDespacho: ResourceMethod<any, any>;
}
