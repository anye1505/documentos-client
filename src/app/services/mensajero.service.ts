
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';


import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/mensajeros'
})

export class MensajeroService extends Rest{

    @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path:'/mensajeroporsucursal'
	})  	
    mensajerobysuc: ResourceMethod<any,any>;

	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true
	})  	
  query: ResourceMethod<any,any>;


  @ResourceAction({
      method: RequestMethod.Get,
      auth: true,
      path:'/count'
  })    
  count: ResourceMethod<any,any>;

  @ResourceAction({
      method: RequestMethod.Post,
      auth: true,
      path:'/crear'
  })    
  crear: ResourceMethod<any,any>;

  @ResourceAction({
      method: RequestMethod.Post,
      auth: true,
      path:'/actualizar'
  })    
  actualizar: ResourceMethod<any,any>;

  @ResourceAction({
    method: RequestMethod.Get,
    auth: true,
    isArray: true,
    path: '/buscar'
})  	
  buscar: ResourceMethod<any, any>;
}
    