import { Component, OnInit, ViewEncapsulation, ViewChild,TemplateRef  } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import {  AuthService } from '../../../services/auth.service';
import {  UserService } from '../../../services/user.service';
import {  RoleService } from '../../../services/role.service';
import { SucursalService } from '../../../services/sucursal.service';
import { EmpresaService } from '../../../services/empresa.service';


import { User,UserEdit,UserResetPassword } from '../../../models/user';

import { Role,RoleMapping } from '../../../models/role';

declare var $: any;

@Component({
    selector: 'user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UserListComponent implements OnInit {

    public filterRows="";
    public modalRef: BsModalRef;
    public formLoading:boolean;
	public identity;
    emp_id_user;
    page:number=-1;

    public idUserRole;
    public roles:Role[];
    public rolesUsuario:RoleMapping[];
    public usuarios:User[];
    public userEdit:UserEdit;
    public userResetPassword:UserResetPassword

    public valForm: FormGroup;
    public valFormChangePassword: FormGroup; 

    toaster: any;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });


    public limit=10;
    public count=0;
    public loading: boolean = false;
    public toasActive;
    public rows = [];
    public columns = [];
    public con;


    public empresas:any;
    public sucursales:any;

    @ViewChild(DatatableComponent) table: DatatableComponent;

    ngOnInit() {

    }
    constructor(
    	fb: FormBuilder,
    	private _authService:AuthService,
    	private _userService:UserService,    	
        private _roleService:RoleService,      
        private _empresaService:EmpresaService,
        private _sucursalService:SucursalService,    
        public toasterService: ToasterService,
        private modalService: BsModalService
    ) {
    	this._empresaService.query(
            {},
            data=>{
                this.empresas=data;                
            },
            error=>{
                  if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para modificar la información', '');
                  }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                  }
            }
        );
        this.loading=false;
        this.formLoading = false;
        this.identity = this._authService.getIdentity();       

        this.userEdit = new UserEdit(0,'','',0,0);
        this.userResetPassword = new UserResetPassword(0,'');

        this.valForm = fb.group({
            'name': [null,Validators.compose([Validators.required,Validators.pattern('^[a-zA-Z ]+$')])],
            'surname':[null,Validators.compose([Validators.required,Validators.pattern('^[a-zA-Z ]+$')])],
            'emp_id': ['',Validators.compose([Validators.required])],
            'suc_id': ['',Validators.compose([Validators.required])],
        });

        let password = new FormControl(null, Validators.required);
        let certainPassword = new FormControl(null, CustomValidators.equalTo(password));
        this.valFormChangePassword = fb.group({
            'passwordGroup': fb.group({
                password: password,
                confirmPassword: certainPassword
            })
        });

        this._userService.find({ id : this.identity.userId },
            data=>{
                this.emp_id_user = data['emp_id'];    console.log("data:",this.emp_id_user);
                this.updateRows();           
            },error=>{                
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
                this.loading=false;
            }
        );
        
    }
    
    onPage(event){
        this.page = event.offset+1;
        this.updateRows(event.offset+1);
    }

    onSort(event){
        console.log(event);
    }
    buscar(){
        this.loading=true;
        let emp_id=0;
        if(this.identity.roles.indexOf('administrador') != -1 && this.emp_id_user != '' && this.emp_id_user != null && this.emp_id_user != undefined){
            emp_id = this.emp_id_user;
            this.valForm.controls['emp_id'].disable();
        }
        this._userService.buscar(
            {emp_id:emp_id,nombre:this.filterRows},
            data=>{this.loading=false;
                console.log("busqueda",data);
                this.rows=data;
                this.rows = [...this.rows];
                this.count = data.length;
                this.loading=false;
            },error=>{this.loading=false;}
        );
    }


    updateFilter(event){
        let val = event.target.value;
        this.filterRows=val;
        if(this.filterRows != ""){
            this.buscar();
            //this.updateRows(1);
        }else{
            if(this.page != -1){this.updateRows(this.page);}
            else{this.updateRows(1);}            
        }
        //{"limit":1,"offset":0,"where":{"id":1}}
    }

    editUser(row,template: TemplateRef<any>){
            this.valForm.controls['suc_id'].setValue(null);
            this.valForm.controls['name'].setValue(null);
            this.valForm.controls['surname'].setValue(null);
            this.valForm.controls['emp_id'].setValue(null);
            this._sucursalService.query(
            {
                filter:{where:{emp_id:row.emp_id}}
            },
            data=>{
                this.sucursales=data;
                this.valForm.controls['suc_id'].setValue(row.suc_id);
            },
            error=>{
              if(error.status===401){
                this.showMessage('warning', 'Ud. no cuenta con permiso para modificar la información', '');
              }else{                  
                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
              }
            }
        );
        this.valForm.controls['name'].setValue(row.name);
        this.valForm.controls['surname'].setValue(row.surname);
        this.valForm.controls['emp_id'].setValue(row.emp_id);
        this.userEdit = new UserEdit(row.id,row.name,row.surname,row.suc_id,row.emp_id);
        this.modalRef = this.modalService.show(template);
    }
    
    editPassword(row,template: TemplateRef<any>){        
        this.userResetPassword = new UserResetPassword(row.id,'');
        this.modalRef = this.modalService.show(template);
    }    

    editRole(row,template: TemplateRef<any>){ 
        this.idUserRole=0;
        this.loading = true;
        this._roleService.query(
            {},
            data=>{
                if(this.identity.roles.indexOf('administrador') != 1 && this.identity.roles.indexOf('admin') == -1){
                    for(let i = 0; i < data.length; i++){
                        if(data[i]['name'] === 'admin'){
                            data.splice(i,1);
                            break;
                        }
                    }
                }console.log("data:",data);
                if(this.identity.roles.indexOf('administrador') != 1 && this.identity.roles.indexOf('admin') == -1 && row.id == this.identity.userId){
                    for(let i = 0; i < data.length; i++){
                        if(data[i]['name'] === 'administrador'){
                            data.splice(i,1);
                            break;
                        }
                    }
                }
                this.roles = data;
                this._userService.roles(
                    {filter:{where:{principalId:row.id}}},
                /*this._userService.getroles(
                    {},*/
                    data=>{
                        this.rolesUsuario = data;
                        this.idUserRole = row.id;
                        for(let i=0;i<this.roles.length;i++){
                            for(let j=0;j<this.rolesUsuario.length;j++){
                                if(this.roles[i]["id"]===this.rolesUsuario[j]["roleId"]){
                                    this.roles[i]["rolemapping"] = this.rolesUsuario[j]["id"];
                                    break;
                                }
                            }
                        }
                        this.modalRef = this.modalService.show(template);
                        this.loading = false;
                    },
                    error=>{
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para modificar la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        this.loading = false;
                    }
                );
            },error=>{
                this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                this.loading = false;
            }
        );
    }

    changeRole(value,role,position){
        this.formLoading = true;
        if(value){
            this._userService.addRole(
                {roleId:role.id,principalId:this.idUserRole,principalType:'USER'},
                data=>{
                    role.rolemapping=data["id"];
                    this.showMessage('success', 'Rol agregado a usuario', '');
                    this.formLoading = false;
                },
                error=>{
                    if(error.status===401){
                        this.showMessage('warning', 'Ud. no cuenta con permiso para modificar la información', '');
                    }else{                  
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                    }
                    this.formLoading = false;
                    $("#trUserRoles").find("[data-index='"+position+"']").find(":checkbox").prop('checked',false);    
                }
            );
        }else{
            let idRoleMapping=role.rolemapping;
            if(idRoleMapping){                
                this._userService.deleteRole(
                    {id:idRoleMapping},
                    data=>{
                        role.rolemapping = null;
                        this.showMessage('success', 'Rol fue eliminado de usuario.', '');
                        this.formLoading = false;
                    },
                    error=>{
                        if(error.status===401){
                            this.showMessage('warning', 'Ud. no cuenta con permiso para modificar la información', '');
                        }else{                  
                            this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                        }
                        $("#trUserRoles").find("[data-index='"+position+"']").find(":checkbox").prop('checked',true);
                        this.formLoading = false;
                    }
                );
            }else{                
                this.showMessage('warning', 'No se puede eliminar rol', '');
                $("#trUserRoles").find("[data-index='"+position+"']").find(":checkbox").prop('checked',true);
                this.formLoading = false;
            }
        }
    }

    updateRows(page=1){

        if(this.con!=null){
            console.log("abort");
            this.con.$abortRequest();
        }
        /*
        if(this.timeOut!=null){
            clearTimeout(this.timeOut);
        }*/
        console.log(this.con);
        //this.timeOut = setTimeout(function(){
            this.loading=true;
            let param={
                limit:this.limit
            };
            let where={}
            /*if(this.filterRows!=""){
                where["name"]={"like":"%"+this.filterRows+"%"};
                where['or'] = [
                    {username:{"like":"%"+this.filterRows+"%"}},
                    {surname:{"like":"%"+this.filterRows+"%"}},
                    {email:{"like":"%"+this.filterRows+"%"}}
                ]                
            }*/
            if(this.identity.roles.indexOf('administrador') != -1 && this.emp_id_user != '' && this.emp_id_user != null && this.emp_id_user != undefined){
                where["emp_id"] = this.emp_id_user;
                this.valForm.controls['emp_id'].disable();
            }
            param["where"]=where;
            if(page > 1){
                param["offset"]=(page*this.limit)-this.limit;
            }console.log("where",where);
            this.con=this._userService.count(
                {where:where},
                count=>{console.log("count",count);
                    if(count.count>0){ console.log("param",param);                               
                        this.con=this._userService.query(
                            {filter:param},
                            data=>{console.log("users:",data);
                                this.rows=data;
                                this.rows = [...this.rows];
                                this.count = count.count;
                                this.loading=false;
                            },
                            error=>{
                                if(error.status===401){
                                    this.showMessage('warning', 'Ud. no cuenta con permiso para ver la información', '');
                                }else{                  
                                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                                }
                                this.loading=false;
                            }
                        );
                    }else{
                        this.rows=[];
                        this.rows = [...this.rows];
                        this.count = 0;
                        this.showMessage('info', 'No se encontraron datos', '');
                        this.loading=false;
                    }
                },
                error=>{
                      if(error.status===401){
                        this.showMessage('warning', 'Ud. no cuenta con permiso para modificar la información', '');
                      }else{                  
                        this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                      }
                      this.loading=false;
                }
            );
        //}, 1000);
    }


    submitFormUserEdit($ev, value: any){
        $ev.preventDefault();
        for (let c in this.valForm.controls) {
            this.valForm.controls[c].markAsTouched();
        }

        if (this.valForm.valid) {
            this.formLoading = true;
            
            this.userEdit.name = value.name;
            this.userEdit.surname = value.surname;
            this.userEdit.suc_id = value.suc_id;
            this.userEdit.emp_id = value.emp_id;

            this._userService.edit(this.userEdit,  
            (user)  =>  {            
                this.showMessage('success', 'Datos actualizados', '');     
                this.formLoading = false;
                for(let i=0;i<this.rows.length;i++){
                    if(this.rows[i].id===this.userEdit.id){
                        this.rows[i].name=this.userEdit.name;
                        this.rows[i].surname=this.userEdit.surname;
                        this.rows[i].suc_id=this.userEdit.suc_id;
                        this.rows[i].emp_id=this.userEdit.emp_id;
                        break;
                    }
                }

                this.rows = [...this.rows];
            },
            error => {
              if(error.status===401){
                this.showMessage('warning', 'Ud. no cuenta con permiso para modificar la información', '');
              }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
              }
              this.formLoading = false;
            });
        }
    }


    submitFormChangePassword($ev, value: any){
        $ev.preventDefault();
        for (let c in this.valFormChangePassword.controls) {
            this.valFormChangePassword.controls[c].markAsTouched();
        }

        if (this.valFormChangePassword.valid) {
        
            this.formLoading = true;
            
            this.userResetPassword.password = value.passwordGroup.password;

            this._userService.resetPassword(this.userResetPassword,  
            (user)  =>  {            
                this.showMessage('success', 'Contraseña actualizada', '');    
                this.formLoading = false;
            },
            error => {
              if(error.status===401){
                this.showMessage('warning', 'Ud. no cuenta con permiso para modificar la información', '');
              }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
              }
              this.formLoading = false;
            });
        }
    }

    showMessage(type,title,message){
        if(this.toasActive!=null){
            this.toasterService.clear(this.toasActive.toastId, this.toasActive.toastContainerId);
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }

    }


    searchSucursal(event){
        this.valForm.controls['suc_id'].setValue(null);
        this._sucursalService.query(
            {filter:{where:{emp_id:event.emp_id}}},
            data=>{
                this.sucursales = data;
            },
            error=>{

              if(error.status===401){
                this.toasterService.pop('warning', "Ud. no cuenta con permiso para crear la información", '');                
              }else{
                this.toasterService.pop('error', "Vuelvalo a intentar en unos minutos", '');
              }
            }
        );

    }
}
