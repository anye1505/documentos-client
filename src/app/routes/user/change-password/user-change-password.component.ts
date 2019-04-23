import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';

import {  AuthService } from '../../../services/auth.service';
import {  UserService } from '../../../services/user.service';


import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';

@Component({
    selector: 'user-change-password',
    templateUrl: './user-change-password.component.html',
    styleUrls: ['./user-change-password.component.scss']
})
export class UserChangePasswordComponent implements OnInit {
	identity;
   	formLoading:boolean;
    valForm: FormGroup;

    toaster: any;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    constructor(
    	fb: FormBuilder,
    	private _authService:AuthService,
    	private _userService:UserService,    	
        public toasterService: ToasterService
    ) {
    	this.identity=this._authService.getIdentity();
    	let password = new FormControl('', Validators.required);
        let certainPassword = new FormControl('', CustomValidators.equalTo(password));

        // Model Driven validation
        this.valForm = fb.group({
            'passwordGroup': fb.group({
                password: password,
                confirmPassword: certainPassword
            })

        });

    }

    ngOnInit() {

    }



    submitForm($ev, value: any) {
    	this.formLoading = true;
        $ev.preventDefault();
        for (let c in this.valForm.controls) {
            this.valForm.controls[c].markAsTouched();
        }
        if (this.valForm.valid) {
            let params={
                id : this.identity.userId,
                password : value.passwordGroup.password
            }   
    		console.log(params);
			this._userService.resetPassword(params,  
			(user)  =>  {			
				this.toasterService.pop('success', "Contaseña cambiada", "");
				this.formLoading = false;
			},
			error => {
			  if(error.status===401){
				this.toasterService.pop('warning', "Ud. no cuenta con permiso para modificar la información", '');			    
			  }else{
				this.toasterService.pop('error', "Vuelvalo a intentar en unos minutos", '');
			  }
			  this.formLoading = false;
			});
        }else{
    		this.formLoading = false;
        }
        
    }
}
