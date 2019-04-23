
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';


import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/personas'
})

export class PersonaService extends Rest{


	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
	    isArray: true
	})  	
  find: ResourceMethod<any,any>;


  @ResourceAction({
      method: RequestMethod.Get,
      auth: true,
      path:'/count'
  })    
  count: ResourceMethod<any,any>;

}
    