import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TreeModule } from 'angular-tree-component';
import { DndModule } from 'ng2-dnd';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
//import { FileUploadModule } from 'ng2-file-upload';
//import { SelectModule } from 'ng2-select';

import { SharedModule } from '../../shared/shared.module';

import { MensajeroListComponent } from './list/mensajero-list.component';

import { MensajeroService } from '../../services/mensajero.service';


const routes: Routes = [
    { path: 'list', component: MensajeroListComponent, 
        data: {
            permissions: {
               only: ['admin','administrador','consultas','distribucion','jefe_distribucion'],
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
        //FileUploadModule,
        NgxDatatableModule
    ],
    declarations: [
        MensajeroListComponent
    ],
    exports: [
        RouterModule
    ],
    providers: [
        MensajeroService
    ]
})
export class MensajeroModule { }
