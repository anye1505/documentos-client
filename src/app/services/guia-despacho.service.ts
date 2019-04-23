import { Injectable } from  '@angular/core';
import { RequestMethod,Http } from '@angular/http';
import { ResourceCRUD,ResourceParams, ResourceMethod, ResourceAction,Resource  } from 'ngx-resource';
import { Rest } from  '../resources/rest.resource';
import { GLOBAL } from '../global';
import { GuiaDespacho } from '../models/guia_despacho';

@Injectable()
@ResourceParams({
 	url:GLOBAL.url,
 	pathPrefix: '/guiasDespacho'
})
export class GuiaDespachoService extends Rest{
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
        path: '/consultaFiltro'
	})  	
    consultaFiltro: ResourceMethod<{}, any>
	@ResourceAction({
	    method: RequestMethod.Post,
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
	    method: RequestMethod.Post,
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
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/despachar'
	})  	
	despachar: ResourceMethod<{}, any>;

	/* Recepción */
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/consultaMultipleRecep'
	})  	
	consultaMultipleRecep: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/consultaNumeroRecep'
	})  	
    consultaNumeroRecep: ResourceMethod<{}, any>;
    @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/consultaOrdenRecep'
	})  	
    consultaOrdenRecep: ResourceMethod<{}, any>;
    @ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/consultaCodigoBarraRecep'
	})  	
	consultaCodigoBarraRecep: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        isArray: true,
        path: '/consultaDetalleRecep'
	})  	
	consultaDetalleRecep: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        path: '/exportarListaGuiasRecep'
	})  	
	exportarListaGuiasRecep: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        path: '/exportarListaGuiasDetalleRecep'
	})  	
	exportarListaGuiasDetalleRecep: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
		auth: true,
		isArray: true,
        path: '/recepcionar'
	})  	
	recepcionar: ResourceMethod<{}, any>;
	@ResourceAction({
	    method: RequestMethod.Get,
	    auth: true,
        path: '/DescargarExcelGuia'
	})  	
	DescargarExcelGuia: ResourceMethod<{}, any>;
}