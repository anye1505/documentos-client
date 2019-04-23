
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';


import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';
import { Empresa } from  '../models/empresa';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/empresas'
})

export class EmpresaService extends Rest{
	
  	/*formDataObject (data) {
    	var fd = new FormData();
    	angular.forEach(data, function(value, key) {
      		fd.append(key, value);      
    	});
    	return fd;
  	}*/
	/*
      updateImageInit:{
        method: 'PUT',
        url: API_URL + '/settings/:settingId/updateImageInit',
        transformRequest: formDataObject,
        headers: {'Content-Type':undefined, enctype:'multipart/form-data'}        
      },

	*/

	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true
	})  	
  query: ResourceMethod<{}, Empresa[]>;


  @ResourceAction({
      method: RequestMethod.Get,
      auth: true,
      isArray: true,
      path:'/operador'
  })    
  operador: ResourceMethod<{}, Empresa[]>;

  @ResourceAction({
      method: RequestMethod.Get,
      auth: true,
      isArray: true,
      path:'/cliente'
  })    
  cliente: ResourceMethod<{}, any>;


  @ResourceAction({
      method: RequestMethod.Get,
      auth: true,
      isArray: true,
      path:'/courier'
  })    
  courier: ResourceMethod<{}, Empresa[]>;

  @ResourceAction({
      method: RequestMethod.Get,
      auth: true,
      isArray: true,
      path:'/distrito'
  })    
  distrito: ResourceMethod<{}, any>;


  @ResourceAction({
      method: RequestMethod.Get,
      auth: true,
      isArray: true,
      path:'/formato'
  })    
  formato: ResourceMethod<{}, any>;

  @ResourceAction({
      method: RequestMethod.Get,
      auth: true,
      isArray: true,
      path:'/mensajero'
  })    
  mensajero: ResourceMethod<{}, any>;

  @ResourceAction({
    method: RequestMethod.Get,
    auth: true,
    isArray: true,
    path:'/mensajeroid'
  })    
    mensajeroid: ResourceMethod<{}, any>;

    @ResourceAction({
        method: RequestMethod.Get,
        auth: true,
        isArray: true,
        path:'/courierLogo'
    })    
    courierLogo: ResourceMethod<{}, Empresa[]>;

}
    