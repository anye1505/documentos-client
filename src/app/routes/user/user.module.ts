import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TreeModule } from 'angular-tree-component';
import { DndModule } from 'ng2-dnd';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { SharedModule } from '../../shared/shared.module';
import { UserCreateComponent } from './create/user-create.component';
import { UserEditComponent } from './edit/user-edit.component';
import { UserChangePasswordComponent } from './change-password/user-change-password.component';
import { UserListComponent } from './list/user-list.component';


const routes: Routes = [
    { path: 'create', component: UserCreateComponent, 
        data: {
            permissions: {
               only: ['admin','administrador'],
               redirectTo: 'home'
            }
        }
    },    
    { path: 'edit', component: UserEditComponent },    
    { path: 'change-password', component: UserChangePasswordComponent },
    { path: 'list', component: UserListComponent , 
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
    UserCreateComponent,
        UserEditComponent,
        UserChangePasswordComponent,
        UserListComponent
    ],
    exports: [
        RouterModule
    ]
})
export class UserModule { }
