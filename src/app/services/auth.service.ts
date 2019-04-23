import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';

@Injectable()
export class AuthService {

	private _identity;
	private _token;

  	isLoggedIn = false;

	// store the URL so we can redirect after logging in
	redirectUrl: string;


	login(): Observable<boolean> {
		return Observable.of(true).delay(1000).do(val => this.isLoggedIn = true);
	}

	logout(): void {
    	localStorage.removeItem('identity');
    	localStorage.removeItem('token');
    	localStorage.clear();      
	}

	isLogged(){		
		let identity = this.getIdentity();
		if( identity!=null){
			return true;
		}else{
			return false;
		}		
	}

	getIdentity(){
		let identity = JSON.parse(localStorage.getItem("identity"));
		if(identity != "undefined" && identity!=null){
			this._identity = identity;
		}else{
			this._identity = null;
		}
		return this._identity;
	}

	getToken(){
		let token = localStorage.getItem("token");
		if(token != "undefined" && token!=null){
			this._token = token;
		}else{
			this._token = null;
		}
		return this._token;
	}
	
	setLocalStorarge(name,value){
		localStorage.setItem(name,value);
	}
}