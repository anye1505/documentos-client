
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';


import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/descargas'
})

export class DownloadService extends Rest{

	@ResourceAction({
	    method: RequestMethod.Get,
	    path: '/token/{!id}',
	    auth: true
	})  	
	  token: ResourceMethod<{id,tipo}, {des_token_validation:any}>;
	  
	  @ResourceAction({
	    method: RequestMethod.Post,
	    path: '/download',
	    auth: true
	})  	
  	url: ResourceMethod<{}, {}>;
}
