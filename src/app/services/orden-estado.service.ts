
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';


import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/ordenEstados'
})

export class OrdenEstadoService extends Rest{
	
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
	find: ResourceMethod<{},any>;

}
