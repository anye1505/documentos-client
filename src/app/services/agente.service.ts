
import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';


import { Rest } from  '../resources/rest.resource';


import { GLOBAL } from '../global';
import { Agente } from  '../models/agente';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/agentes'
})

export class AgenteService extends Rest{
	
    @ResourceAction({
        method: RequestMethod.Get,
        auth: true,
        isArray: true,
        path:'/agentes'
    })    
    agentes: ResourceMethod<{}, any>;

    @ResourceAction({
        method: RequestMethod.Get,
        auth: true,
        isArray: true,
        path:'/sucursalAgentes'
    })    
    sucursalAgentes: ResourceMethod<{}, any>;

    @ResourceAction({
        method: RequestMethod.Post,
        auth: true,
        path:'/agregar'
    })    
    agregar: ResourceMethod<any,any>;

    @ResourceAction({
        method: RequestMethod.Post,
        auth: true,
        path:'/eliminar'
    })    
    eliminar: ResourceMethod<any,any>;
}
    