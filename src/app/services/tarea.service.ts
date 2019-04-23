
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';

import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';

import { Role } from  '../models/role';


@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/tareas'
})


export class TareaService extends Rest{
	
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
	    path: '/reporte'
	})  	
  	reporte: ResourceMethod<any, any>;


	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray:true
	    //path: '/'
	})  	
  	find: ResourceMethod<any, any>;

	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    path: '/count'
	})  	
	  count: ResourceMethod<any, any>;
	  
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        path: '/planilla_mensajero'
	})  	
	planilla_mensajero: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        path: '/planilla_agente'
	})  	
	planilla_agente: ResourceMethod<{}, any>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        path: '/liquidacion_operador'
	})  	
	liquidacion_operador: ResourceMethod<{}, any>;
}
