import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';
import { Rest } from  '../resources/rest.resource';
import { GLOBAL } from '../global';
import { Guia } from '../models/guia';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/reportes'
})
export class ReportesService extends Rest{
    @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
		isArray: true,
		path: '/buscar'
	})  	
    buscar: ResourceMethod<{},any>;
    @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/consultaMultiple'
	})  	
    consultaMultiple: ResourceMethod<{}, any>;
    @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/consultaNumero'
	})  	
    consultaNumero: ResourceMethod<{}, any>;
    @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/consultaOrden'
	})  	
    consultaOrden: ResourceMethod<{}, any>;
    @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/consultaCodigoBarra'
	})  	
	consultaCodigoBarra: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/consultaDetalle'
	})  	
    consultaDetalle: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/guardar'
	})  	
	guardar: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/eliminar'
	})  	
	eliminar: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/resetear'
	})  	
	resetear: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/entregar'
	})  	
	entregar: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/asignarRango'
	})  	
	asignarRango: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/asignarDocumentosValidar'
	})  	
	asignarDocumentosValidar: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/asignarDocumentos'
	})  	
	asignarDocumentos: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Post,
	    auth: true,
        isArray: true,
        path: '/asignarDocumentosVarios'
	})  	
	asignarDocumentosVarios: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/quitarDocumento'
	})  	
	quitarDocumento: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        path: '/exportarListaGuias'
	})  	
	exportarListaGuias: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        path: '/exportarListaGuiasDetalle'
	})  	
	exportarListaGuiasDetalle: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        path: '/ImpimirGuiaDetalle'
	})  	
	ImpimirGuiaDetalle: ResourceMethod<{}, any>;
}