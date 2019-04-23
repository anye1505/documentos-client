import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';

import {  AuthService } from '../../../services/auth.service';
import {  UserService } from '../../../services/user.service';


import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';

@Component({
    selector: 'user-edit',
    templateUrl: './user-edit.component.html',
    styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {
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

        // Model Driven validation
        this.valForm = fb.group({
            'name': [this.identity.name, Validators.compose([Validators.required,Validators.pattern('^[a-zA-Z ]+$')])],
            'surname': [this.identity.surname,Validators.compose([Validators.required,Validators.pattern('^[a-zA-Z ]+$')])]
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
    		value.id = this.identity.userId;
			this._userService.edit(value,  
			(user)  =>  {			
				this.toasterService.pop('success', "Usuario modificado", "");
			    let identity = this.identity;
			    identity.name = value.name;
			    identity.surname = value.surname;
			    localStorage.setItem('identity',JSON.stringify(identity));
				this.formLoading = false;
                //$("#spanUser").html(value.username+", "+value.surname);
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
