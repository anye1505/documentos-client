import { NgModule, NO_ERRORS_SCHEMA,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EstadisticasComponent } from './estadisticas/estadisticas.component';
import { Routes, RouterModule } from '@angular/router';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { TreeModule } from 'angular-tree-component';
import { DndModule } from 'ng2-dnd';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FileUploadModule } from 'ng2-file-upload';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
    { path: 'proceso', component: EstadisticasComponent,
        data: {
            permissions: {
            only: ['admin','cliente'],
            redirectTo: 'home'
            }
        }
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        ChartsModule,
        TreeModule,
        DndModule.forRoot(),
        InfiniteScrollModule,
        FileUploadModule,
        NgxDatatableModule,
        SharedModule
    ],
    declarations: [EstadisticasComponent],
    exports: [
        RouterModule
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
})
export class EstadisticasModule { }
