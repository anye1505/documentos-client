import { Injectable }     from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
}                           from '@angular/router';

//import { CanActivate }    from '@angular/router';

import { AuthService }      from './auth.service';

import { NgxPermissionsService } from 'ngx-permissions';
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private permissionsService: NgxPermissionsService,private authService: AuthService, private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
			console.log("state:",state);
    	let url: string = state.url;

    	return this.checkLogin(url);
  	}

  	checkLogin(url: string): boolean {
      
    	//if (this.authService.isLoggedIn) { return true; }
      if (this.authService.isLogged()) {
        
        let identity=this.authService.getIdentity();
        this.permissionsService.loadPermissions(identity.roles?identity.roles:[])
        return true; 
      }

    	// Store the attempted URL for redirecting
    	this.authService.redirectUrl = url;

    	// Navigate to the login page with extras
    	this.router.navigate(['/login']);
    	return false;
  	}
/*
  	canActivate() {
    	console.log('AuthGuard#canActivate called');
    	return true;
  	}
  	*/
}