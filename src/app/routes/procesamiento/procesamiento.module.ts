import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TreeModule } from 'angular-tree-component';
import { DndModule } from 'ng2-dnd';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FileUploadModule } from 'ng2-file-upload';
//import { SelectModule } from 'ng2-select';

import { SharedModule } from '../../shared/shared.module';

import { ProcesamientoOrdenComponent } from './orden/procesamiento-orden.component';
import { ProcesamientoConsumoComponent } from './consumo/procesamiento-consumo.component';
import { CargoComponent } from './cargo/cargo.component';
import { ProcesamientoServicioComponent } from './servicio/procesamiento-servicio.component';

import { OrdenService } from '../../services/orden.service';
import { DownloadService } from '../../services/download.service';
import { CargoService } from '../../services/cargo.service';


const routes: Routes = [
    { path: 'orden', component: ProcesamientoOrdenComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','produccion','ejecutivo'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'consumo', component: ProcesamientoConsumoComponent , 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','ejecutivo'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'cargo', component: CargoComponent , 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','produccion','ejecutivo'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'servicio', component: ProcesamientoServicioComponent , 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','produccion','ejecutivo'],
               redirectTo: 'home'
            }
        }
    }
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
        TreeModule,
        DndModule.forRoot(),
        InfiniteScrollModule,
        FileUploadModule,
        NgxDatatableModule
    ],
    declarations: [
        ProcesamientoOrdenComponent,
        ProcesamientoConsumoComponent,
        CargoComponent,
        ProcesamientoServicioComponent
    ],
    exports: [
        RouterModule
    ],
    providers: [
        OrdenService,
        DownloadService,
        CargoService
    ]
})
export class ProcesamientoModule { }
