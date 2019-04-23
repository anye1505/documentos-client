import { NgModule } from '@angular/core';
import { RouterModule , PreloadAllModules} from '@angular/router';
import { TranslatorService } from '../core/translator/translator.service';
import { MenuService } from '../core/menu/menu.service';
import { SharedModule } from '../shared/shared.module';
import { PagesModule } from './pages/pages.module';

import { UserModule } from './user/user.module';
import { ProcesamientoModule } from './procesamiento/procesamiento.module';
import { MantenimientoModule } from './mantenimiento/mantenimiento.module';
import { DistribucionModule } from './distribucion/distribucion.module';
import { MensajeroModule } from './mensajero/mensajero.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';

import { NoClasificadoService } from '../services/no-clasificado.service'

import { GuiaService } from '../services/guia.service';
import { GuiaEstadoService } from '../services/guia-estado.service';

import { GuiaDespachoService } from '../services/guia-despacho.service';
import { GuiaDespachoEstadoService } from '../services/guia-despacho-estado.service';

import { ConsultaDocumentosService } from '../services/consulta-documentos.service';

import { DescargaGestionService } from '../services/descarga-gestion.service';
import { CambioGestionService } from '../services/cambio-gestion.service';
import { GestionClientesService } from '../services/gestion-clientes.service';

import { ReportesService } from '../services/reportes.service';
import { AgenteService } from '../services/agente.service';

import { menu } from './menu';
import { routes } from './routes';

import { AuthGuard }   from '../services/auth-guard.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';
import { EmpresaService } from '../services/empresa.service';
import { ProductoService } from '../services/producto.service';
import { SucursalService } from '../services/sucursal.service';
import { ClienteService } from '../services/cliente.service';
import { ModeloDistribucionService } from '../services/modelo-distribucion.service';
import { ReglaDistribucionService } from '../services/regla-distribucion.service';
import { TipoCargoService } from '../services/tipo-cargo.service';
import { TipoEtiquetaService } from '../services/tipo-etiqueta.service';
import { OrdenEstadoService } from '../services/orden-estado.service';
import { TareaService } from '../services/tarea.service';
import { MensajeroService } from '../services/mensajero.service';
import { PersonaService } from '../services/persona.service';
import { UbigeoService } from '../services/ubigeo.service';
import { TipoReseteoService  } from '../services/tipo-reseteo.service';
import { DocumentoReseteoService  } from '../services/documento-reseteo.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { EstadisticasService } from '../services/estadisticas.servicie';

import { AppCustomPreloader } from './app-routing-loader';
@NgModule({
    imports: [
        SharedModule,
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules ,useHash: true }),
        PagesModule,
        UserModule,
        ProcesamientoModule,
        MantenimientoModule,
        DistribucionModule,
        MensajeroModule,
        EstadisticasModule
    ],
    declarations: [],
    exports: [
        RouterModule
    ],
    providers: [
        AuthGuard,
        AuthService,
        UserService,
        RoleService,
        EmpresaService,
        SucursalService,
        ProductoService,
        NgxPermissionsService,
        ClienteService,
        ModeloDistribucionService,
        ReglaDistribucionService,
        TipoCargoService,
        TipoEtiquetaService,
        OrdenEstadoService,
        TareaService,
        GuiaService,
        GuiaEstadoService,
        MensajeroService,
        PersonaService,
        UbigeoService,
        TipoReseteoService,
        DocumentoReseteoService,
        GuiaDespachoService,
        GuiaDespachoEstadoService,
        NoClasificadoService,
        DescargaGestionService,
        ConsultaDocumentosService,
        CambioGestionService,
        GestionClientesService,
        ReportesService,
        EstadisticasService,
        AgenteService
    ]
})


export class RoutesModule {
    constructor(public menuService: MenuService, tr: TranslatorService) {
        menuService.addMenu(menu);
    }
}
