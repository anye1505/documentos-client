import { Component, OnInit, ViewChild } from '@angular/core';
import { Router }      from '@angular/router';
const screenfull = require('screenfull');
const browser = require('jquery.browser');
declare var $: any;

import { UserblockService } from '../sidebar/userblock/userblock.service';
import { SettingsService } from '../../core/settings/settings.service';
import { MenuService } from '../../core/menu/menu.service';
import { SucursalService } from '../../services/sucursal.service';
import { EmpresaService } from '../../services/empresa.service';

import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { NgxPermissionsService } from 'ngx-permissions';

import { GLOBAL } from '../../global';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    navCollapsed = true; // for horizontal layout
    menuItems = []; // for horizontal layout

    isNavSearchVisible: boolean;
    @ViewChild('fsbutton') fsbutton;  // the fullscreen button

    toasActive;
    toaster: any;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    user: any;
    public identity;
    public token;
    public logo='';
    constructor(
        public menu: MenuService,
        public userblockService: UserblockService, 
        public settings: SettingsService,
        private _authService:AuthService,
        private _userService:UserService,
        private router: Router,
        private _sucursalService:SucursalService,
        private _empresaService:EmpresaService,
        private permissionsService: NgxPermissionsService,
        public toasterService: ToasterService
    ) {

        this.checkToken();
        this.initListener();
        this.initInterval();

        // show only a few items on demo
        this.menuItems = menu.getMenu().slice(0,4); // for horizontal layout
        this.identity = this._authService.getIdentity();
        if(this.identity!=null){            
            this.user = {
                name:this.identity.name,
                surname:this.identity.surname,
                userId:this.identity.userId
            };
            if(this.identity.roles){
                this.user.role = this.identity.roles.join();
                /*if(this.identity.roles.indexOf('admin') == -1 || this.identity.roles.indexOf('administrador') == -1){
                    this.user.role = this.identity.roles[0];
                }else{
                    this.user.role = 'administrador';
                }*/
                /*for(let i=0;i<this.identity.roles;i++){
                    
                    if(this.identity.roles[i]=='admin' || )
                }*/
            }
        }
        if(this.user){
            this._userService.find({ id : this.user.userId },
                data=>{     console.log("data:",data); 
                    let param={
                        emp_id:data['emp_id']
                    };
                    this._empresaService.query(
                        {filter:{
                            where: param
                            }
                        },
                        data=>{                  
                            this.user.courier = data[0]['emp_abrev'];
                        },
                        error=>{}
                    );
                    this._sucursalService.query(
                        {filter:{where:{suc_id:data['suc_id']  }}},
                        data=>{
                            this.user.suc = data[0]['suc_nombre'];
                        },
                        error=>{}
                    );
                    
                },
                error=>{
                }
            );
        }
        /*POST*/
        /*this._userService.getroles(
            {},
            data=>{
                if(data.length<1){
                    this.showMessage('warning', 'Ud. no tiene asociado un rol.', '');
                }else{
                    let perm = [];
                    for(let i=0;i<data.length;i++){
                        perm.push(data[i].name);
                    }         
                    
                    this.permissionsService.loadPermissions(perm)
                    this.identity['roles']=perm;
                    this._authService.setLocalStorarge('identity',JSON.stringify(this.identity));
                    if(this.identity.roles){
                        this.user.role = this.identity.roles.join();}
                }
            },
            error=>{                        
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para obtener los permisos', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            }
        );*/
        /*GET */
        this._userService.roles(
            {filter:{include:"role",where:{principalId:this.identity.userId}}},
            data=>{
                if(data.length<1){
                    this.showMessage('warning', 'Ud. no tiene asociado un rol.', '');
                }else{
                    let perm = [];
                    for(let i=0;i<data.length;i++){
                        perm.push(data[i]["role"].name);
                    }         
                    
                    this.permissionsService.loadPermissions(perm)
                    this.identity['roles']=perm;
                    this._authService.setLocalStorarge('identity',JSON.stringify(this.identity));
                    if(this.identity.roles){
                        this.user.role = this.identity.roles.join();}
                }
            },
            error=>{                        
                if(error.status===401){
                    this.showMessage('warning', 'Ud. no cuenta con permiso para obtener los permisos', '');
                }else{                  
                    this.showMessage('error', 'Vuelva a intentar en unos minutos', '');
                }
            }
        );

    }

    ngOnInit() {
        this.isNavSearchVisible = false;
        if (browser.msie) { // Not supported under IE
            this.fsbutton.nativeElement.style.display = 'none';
        }        

        this.identity = this._authService.getIdentity();
        this.token = this._authService.getToken();

        /*logo para courier*/
        let logo = document.getElementById("logo");
        logo.innerHTML = '';
        this._empresaService.courierLogo(
            {},
            data=>{                  
                this.logo = data[0]['emp_logotipo'];
                if(this.logo){
                    logo.innerHTML = '<img class="img-responsive" src="'+GLOBAL.url2+this.logo+'" alt="App Logo" />';
                }else{
                    logo.innerHTML = '<img class="img-responsive" src="assets/img/logo.png" alt="App Logo" />';
                }
            },
            error=>{}
        );        
        /*Fin logo para courier*/
    }


    initListener(){    
        document.body.addEventListener('click', () => this.reset());
        document.body.addEventListener('mouseover',()=> this.reset());
        document.body.addEventListener('mouseout',() => this.reset());
        document.body.addEventListener('keydown',() => this.reset());
        document.body.addEventListener('keyup',() => this.reset());
        document.body.addEventListener('keypress',() => this.reset());
    }


    initInterval(){        
        setInterval(() => {
           this.checkToken();
        }, GLOBAL.checkInterval);
    }

    reset(){
        this.identity = this._authService.getIdentity();
        if(this.identity!=null){
          let dt=new Date();
          this.identity.lastAction=dt.getTime() / 1000;
          this._authService.setLocalStorarge('identity',JSON.stringify(this.identity));
          //localStorage.setItem('identity',JSON.stringify(this.identity));
        }
    }

    checkToken(){
         this.identity = this._authService.getIdentity();
         if(this.identity!=null){
            let dt=new Date();
            let now = dt.getTime() / 1000;
            let ses =this.identity.lastAction + GLOBAL.segundos_autologout;
            if(ses <= now){         
                  this.logout(); 
            }else{
              let init = this.identity.init + this.identity.ttl;

              if(init <= now){
                  this.logout();
              }          
            }
          }
    }


    toggleUserBlock(event) {
        event.preventDefault();
        this.userblockService.toggleVisibility();
    }

    openNavSearch(event) {
        event.preventDefault();
        event.stopPropagation();
        this.setNavSearchVisible(true);
    }

    setNavSearchVisible(stat: boolean) {
        // console.log(stat);
        this.isNavSearchVisible = stat;
    }

    getNavSearchVisible() {
        return this.isNavSearchVisible;
    }

    toggleOffsidebar() {
        this.settings.layout.offsidebarOpen = !this.settings.layout.offsidebarOpen;
    }

    toggleCollapsedSideabar() {
        this.settings.layout.isCollapsed = !this.settings.layout.isCollapsed;
    }

    isCollapsedText() {
        return this.settings.layout.isCollapsedText;
    }

    toggleFullScreen(event) {

        if (screenfull.enabled) {
            screenfull.toggle();
        }
        // Switch icon indicator
        let el = $(this.fsbutton.nativeElement);
        if (screenfull.isFullscreen) {
            el.children('em').removeClass('fa-expand').addClass('fa-compress');
        }
        else {
            el.children('em').removeClass('fa-compress').addClass('fa-expand');
        }
    }

    logout(){
        this._userService.logout();  
        this._authService.logout();        
        localStorage.removeItem('identity');
        localStorage.removeItem('token');
        localStorage.clear();     
        this.router.navigate(['login']);        
    }

    showMessage(type,title,message){
        if(this.toasActive!=null){
            this.toasterService.clear(this.toasActive.toastId, this.toasActive.toastContainerId);
            this.toasActive = this.toasterService.pop(type, title, message);
        }else{
            this.toasActive = this.toasterService.pop(type, title, message);            
        }

    }
}
