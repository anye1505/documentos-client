import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TreeModule } from 'angular-tree-component';
import { DndModule } from 'ng2-dnd';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { SharedModule } from '../../shared/shared.module';

import { ReporteTareaComponent } from './tarea/reporte-tarea.component';
import { DatosCierreComponent } from './datos/datos-cierre.component';

import { OrdenService } from '../../services/orden.service';
import { DownloadService } from '../../services/download.service';
import { CargoService } from '../../services/cargo.service';


const routes: Routes = [
    { path: 'tarea', component: ReporteTareaComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','produccion','ejecutivo'],
               redirectTo: 'home'
            }
        }
    },
    { path: 'datos-cierre', component: DatosCierreComponent, 
        data: {
            permissions: {
               only: ['admin','administrador'],
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
        NgxDatatableModule
    ],
    declarations: [
        ReporteTareaComponent,
        DatosCierreComponent
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
export class ReporteModule { }
