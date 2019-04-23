
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';


import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';
import { Orden,Consumo } from  '../models/orden';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/ordenes'
})

export class OrdenService extends Rest{
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/consultaMultiple'
	})  	
    consultaMultiple: ResourceMethod<{}, any>;
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
	    path: '/buscar',
	    auth: true,
	    isArray: true
	})  	
  	query: ResourceMethod<{}, Orden[]>;

	@ResourceAction({
	    method: RequestMethod.Get,
	    path: '/contar',
	    auth: true
	})  	
  	count: ResourceMethod<{}, {count:number}>;

	@ResourceAction({
	    method: RequestMethod.Get,
	    path: '/consumo',
	    auth: true,
	    isArray: true
	})  	
  	consumo: ResourceMethod<{}, Consumo[]>;


	@ResourceAction({
	    method: RequestMethod.Post,
	    path: '/generarOP',
	    auth: true
	})  	
  	generarOP: ResourceMethod<any, any>;


	@ResourceAction({
	    method: RequestMethod.Post,
	    path: '/generarEtiqueta',
	    auth: true
	})  	
  	generarEtiqueta: ResourceMethod<any, any>;

  	
	@ResourceAction({
	    method: RequestMethod.Post,
	    path: '/descargarSIM',
	    auth: true
	})  	
  	descargarSIM: ResourceMethod<any, any>;

	@ResourceAction({
	    method: RequestMethod.Post,
	    path: '/generarOPapido',
	    auth: true
	})  	
  	generarOPapido: ResourceMethod<any, any>;


	@ResourceAction({
	    method: RequestMethod.Post,
	    path: '/eliminar',
	    auth: true
	})  	
	  eliminar: ResourceMethod<any, any>;

	@ResourceAction({
	    method: RequestMethod.Get,
	    path: '/cargarbaseformato/{!type}',
	    auth: true
	})  	
	cargarbaseformato: ResourceMethod<{type},any>;
	  
	
	  @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        path: '/exportarListaOS'
	})  	
	exportarListaOS: ResourceMethod<{}, any>;
  	

/*
	@ResourceAction({
	    method: RequestMethod.Get,
	    path: '/download/{!ord_id}',
	    auth: true/*,
		responseType: 'arraybuffer',
		cache: false,
		transformResponse: (data, headers) => {
			var zip = null;
			if (data) {
				zip = new Blob([data], {
			  		type: 'application/zip' //or whatever you need, should match the 'accept headers' above
				});
			}

			//server should sent content-disposition header
			var fileName: string = getFileNameFromHeader(headers('content-disposition'));
			var result = {
				blob: zip,
				fileName: fileName
			};

			return {
				response: result
			};
		}*/
	/*})  	
  	download: ResourceMethod<{ord_id}, Consumo[]>;*/
}
