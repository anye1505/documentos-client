import { Component, OnInit } from '@angular/core';
import { Router }      from '@angular/router';
import { SettingsService } from '../../../core/settings/settings.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';

import { AuthService } from '../../../services/auth.service';

import { UserService } from '../../../services/user.service';

import { Login } from '../../../models/user';
import { GLOBAL } from '../../../global';

import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']

})
export class LoginComponent implements OnInit{

    public identity;
    //public token;
    public formLoading:boolean;

    valForm: FormGroup;

    toaster: any;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    public alerts: Array<Object> = [
    ];

    constructor(
        public settings: SettingsService,
        fb: FormBuilder,
        private _authService:AuthService,
        private _userService:UserService,
        private router: Router,
        public toasterService: ToasterService
        
     ) {
        if(this._authService.isLogged()){
            let redirect = this._authService.redirectUrl ? this._authService.redirectUrl : '/home';
            this.router.navigate([redirect]);
        }
        this.formLoading = false;
        this.valForm = fb.group({
            'email': [null, Validators.compose([Validators.required, CustomValidators.email])],
            'password': [null, Validators.required]
        });

    }


    ngOnInit() {
    }

    closeAllAlert():void{
        this.alerts=[];
    }

    closeAlert(i: number): void {
        this.alerts.splice(i, 1);
    }

    addAlert(msg:string,type:string,closable:boolean): void {
        this.alerts.push({ msg: msg, type: type, closable:closable });
    }
    

    submitForm($ev, value: any) {
        this.formLoading=true;
        this.closeAllAlert();
        $ev.preventDefault();
        for (let c in this.valForm.controls) {
            this.valForm.controls[c].markAsTouched();
        }
        if (this.valForm.valid) {
            let login = new Login(value.email,value.password,GLOBAL.realm,GLOBAL.ttl);
            
            this._userService.login(login,  
            (identity)  =>  {
                if(!identity.id){                    
                    this.addAlert('El usuario no se ha conectado correctamente','info',true);  
                    this.formLoading=false;    
                }else{
                    if(identity.id.length <= 0){
                        this.addAlert('El token no se ha generado correctamente','info',true);
                        this.formLoading=false;
                    }else{
                        this._authService.setLocalStorarge('token',identity.id);
                        this._userService.find({id:identity.userId}
                        ,(user) => {
                            this.identity = identity;
                            this.identity.name = user.name;
                            this.identity.username = user.username;
                            this.identity.surname = user.surname ? user.surname : '';

                            let dt=new Date(identity.created);
                            this.identity.init=dt.getTime() / 1000;
                            this.identity.lastAction=dt.getTime() / 1000;
                            this._authService.setLocalStorarge('identity',JSON.stringify(this.identity));

                            this._authService.isLoggedIn = true;
                            let redirect = this._authService.redirectUrl ? this._authService.redirectUrl : '/home';
                            this.router.navigate([redirect]);

                            this.formLoading=false;
                            /*this._authService.login().subscribe(() => {
                                if (this._authService.isLoggedIn = true;) {
                                    // Get the redirect URL from our auth service
                                    // If no redirect has been set, use the default
                                    let redirect = this._authService.redirectUrl ? this._authService.redirectUrl : '/home';
                         
                                    // Redirect the user
                                    this.router.navigate([redirect]);
                                }else{

                                }
                            }); */                   
                        },
                        error=>{
                            this.addAlert('Usuario y/o contraseña erronea','info',true);                      
                            localStorage.removeItem('token');
                            localStorage.clear();  
                            this.formLoading=false;
                        });              
                    }
                } 
            },
            error => {
                if(error.status===401){
                    this.addAlert('Usuario y/o contraseña erronea','info',true);
                }else{
                    this.addAlert('Vuelva a intentar en unos minutos','error',true);                    
                }
                this.formLoading=false;
            });
        }
    }

}
