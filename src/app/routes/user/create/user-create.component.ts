import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { GLOBAL } from '../../../global';


import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { SucursalService } from '../../../services/sucursal.service';
import { EmpresaService } from '../../../services/empresa.service';
import { UserCreate } from '../../../models/user';


import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';

@Component({
    selector: 'user-create',
    templateUrl: './user-create.component.html'
})
export class UserCreateComponent implements OnInit {
	identity;
   	formLoading:boolean;
    valForm: FormGroup;
    Isadministrador:boolean=false;
    emp_id_user;

    public userCreate:UserCreate;

    toaster: any;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    sucursales:any;
    empresas:any;

    constructor(
    	fb: FormBuilder,
    	private _authService:AuthService,
    	private _userService:UserService,    
        private _empresaService:EmpresaService,
        private _sucursalService:SucursalService,        	
        public toasterService: ToasterService
    ) {

        this._empresaService.query({},
            data=>{
                this.empresas=data;
            },
            error=>{                
              if(error.status===401){
                this.toasterService.pop('warning', "Ud. no cuenta con permiso para crear la información", '');                
              }else{
                this.toasterService.pop('error', "Vuelvalo a intentar en unos minutos", '');
              }
            }
        );
        this.userCreate = new UserCreate('','','','','',GLOBAL.realm,0,0);
    	this.identity=this._authService.getIdentity();
    	let password = new FormControl('', Validators.required);
        let certainPassword = new FormControl('', CustomValidators.equalTo(password));

        // Model Driven validation
        this.valForm = fb.group({
            'username': ['', Validators.compose([Validators.required,Validators.pattern('^[a-zA-Z0-9.]+$')])],
            'name': ['', Validators.compose([Validators.required,Validators.pattern('^[a-zA-Z ]+$')])],
            'surname': ['',Validators.compose([Validators.required,Validators.pattern('^[a-zA-Z ]+$')])],
            'email': ['',Validators.compose([Validators.required,CustomValidators.email])],
            'empresa': ['',Validators.compose([Validators.required])],
            'sucursal': ['',Validators.compose([Validators.required])],
            'passwordGroup': fb.group({
                password: password,
                confirmPassword: certainPassword
            })
        });

        if(this.identity.roles.indexOf('administrador') != -1){
            this.Isadministrador = true;
            this.valForm.controls['empresa'].disable();
            this._userService.find({ id : this.identity.userId },
                data=>{
                    this.valForm.controls['empresa'].setValue(data['emp_id']);
                    this.searchSucursal(data['emp_id']);
                }
            );
            
        }
        
    }

    ngOnInit() {

    }



    submitForm($ev, value: any) {
    	this.formLoading = true;
        $ev.preventDefault();
        for (let c in this.valForm.controls) {
            this.valForm.controls[c].markAsTouched();
        }
        if (this.valForm.valid) {   console.log("emp_id:",value.empresa)         
    		this.userCreate.username=value.username.toUpperCase();
            this.userCreate.name=value.name.toUpperCase();
            this.userCreate.surname = value.surname.toUpperCase();            
            this.userCreate.email = value.email;
            this.userCreate.password = value.passwordGroup.password;        
            this.userCreate.suc_id = value.sucursal;
            this.userCreate.emp_id = this.valForm.controls['empresa'].value;
			this._userService.create(this.userCreate,
			(user)  =>  {			
				this.toasterService.pop('success', "Usuario creado", "");
				this.formLoading = false;
                //$("#spanUser").html(value.username+", "+value.surname);
			},
			error => {
			  if(error.status===401){
				this.toasterService.pop('warning', "Ud. no cuenta con permiso para crear la información", '');			    
			  }else{
                  if(error.status===422){
                    this.toasterService.pop('warning', "Usuario y/o email ya existe", '');                
                  }else{
				    this.toasterService.pop('error', "Vuelvalo a intentar en unos minutos", '');
                }
			  }
			  this.formLoading = false;
			});
        }else{
    		this.formLoading = false;
        }
        
    }

    searchSucursal(event){
        this.valForm.controls['sucursal'].setValue(null);
        this._sucursalService.query(
            {filter:{where:{emp_id:event}}},
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
