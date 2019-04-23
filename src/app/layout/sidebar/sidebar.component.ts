import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
declare var $: any;

import { MenuService } from '../../core/menu/menu.service';
import { SettingsService } from '../../core/settings/settings.service';

import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';


import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

    menuItems: Array<any>;
    router: Router;
    sbclickEvent = 'click.sidebar-toggle';
    $doc: any = null;
    identity;

    toasActive;
    toaster: any;
    toasterConfig: any;
    toasterconfig: ToasterConfig = new ToasterConfig({
        positionClass: 'toast-bottom-right',
        showCloseButton: true
    });

    constructor(
        public toasterService: ToasterService,
        private _authService:AuthService,
        private _userService:UserService,
        private permissionsService: NgxPermissionsService,
        public menu: MenuService, 
        public settings: SettingsService, 
        public injector: Injector) {

        this.identity = this._authService.getIdentity();
        console.log(menu.getMenu());
        this.menuItems = menu.getMenu();

    }

    ngOnInit() {
console.log(this.permissionsService.getPermissions());
        this.router = this.injector.get(Router);

        this.router.events.subscribe((val) => {
            // close any submenu opened when route changes
            this.removeFloatingNav();
            // scroll view to top
            window.scrollTo(0, 0);
            // close sidebar on route change
            this.settings.layout.asideToggled = false;
        });

        // enable sidebar autoclose from extenal clicks
        this.anyClickClose();
        this._userService.find({ id : this.identity.userId },
            data=>{
                this.identity['emp_id']=data['emp_id'];
                this.identity['suc_id']=data['suc_id'];
                this._authService.setLocalStorarge('identity',JSON.stringify(this.identity));
            },
            error=>{
            }
        );
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

    anyClickClose() {
        this.$doc = $(document).on(this.sbclickEvent, (e) => {
            if (!$(e.target).parents('.aside').length) {
                this.settings.layout.asideToggled = false;
            }
        });
    }

    ngOnDestroy() {
        if (this.$doc)
            this.$doc.off(this.sbclickEvent);
    }

    toggleSubmenuClick(event) {
        if (!this.isSidebarCollapsed() && !this.isSidebarCollapsedText() && !this.isEnabledHover()) {
            event.preventDefault();

            let target = $(event.target || event.srcElement || event.currentTarget);
            let ul, anchor = target;

            // find the UL
            if (!target.is('a')) {
                anchor = target.parent('a').first();
            }
            ul = anchor.next();

            // hide other submenus
            let parentNav = ul.parents('.sidebar-subnav');
            $('.sidebar-subnav').each((idx, el) => {
                let $el = $(el);
                // if element is not a parent or self ul
                if (!$el.is(parentNav) && !$el.is(ul)) {
                    this.closeMenu($el);
                }
            });

            // abort if not UL to process
            if (!ul.length) {
                return;
            }

            // any child menu should start closed
            ul.find('.sidebar-subnav').each((idx, el) => {
                this.closeMenu($(el));
            });

            // toggle UL height
            if (parseInt(ul.height(), 0)) {
                this.closeMenu(ul);
            }
            else {
                // expand menu
                ul.on('transitionend', () => {
                    ul.height('auto').off('transitionend');
                }).height(ul[0].scrollHeight);
                // add class to manage animation
                ul.addClass('opening');
            }

        }

    }

    // Close menu collapsing height
    closeMenu(elem) {
        elem.height(elem[0].scrollHeight); // set height
        elem.height(0); // and move to zero to collapse
        elem.removeClass('opening');
    }

    toggleSubmenuHover(event) {
        let self = this;
        if (this.isSidebarCollapsed() || this.isSidebarCollapsedText() || this.isEnabledHover()) {
            event.preventDefault();

            this.removeFloatingNav();

            let target = $(event.target || event.srcElement || event.currentTarget);
            let ul, anchor = target;
            // find the UL
            if (!target.is('a')) {
                anchor = target.parent('a');
            }
            ul = anchor.next();

            if (!ul.length) {
                return; // if not submenu return
            }

            let $aside = $('.aside');
            let $asideInner = $aside.children('.aside-inner'); // for top offset calculation
            let $sidebar = $asideInner.children('.sidebar');
            let mar = parseInt($asideInner.css('padding-top'), 0) + parseInt($aside.css('padding-top'), 0);
            let itemTop = ((anchor.parent().position().top) + mar) - $sidebar.scrollTop();

            let floatingNav = ul.clone().appendTo($aside);
            let vwHeight = $(window).height();

            // let itemTop = anchor.position().top || anchor.offset().top;

            floatingNav
                .removeClass('opening') // necesary for demo if switched between normal//collapsed mode
                .addClass('nav-floating')
                .css({
                    position: this.settings.layout.isFixed ? 'fixed' : 'absolute',
                    top: itemTop,
                    bottom: (floatingNav.outerHeight(true) + itemTop > vwHeight) ? 0 : 'auto'
                });

            floatingNav
                .on('mouseleave', () => { floatingNav.remove(); })
                .find('a').on('click', function(e) {
                    e.preventDefault(); // prevents page reload on click
                    // get the exact route path to navigate
                    let routeTo = $(this).attr('route');
                    if (routeTo) self.router.navigate([routeTo]);
                });

            this.listenForExternalClicks();

        }

    }

    listenForExternalClicks() {
        let $doc = $(document).on('click.sidebar', (e) => {
            if (!$(e.target).parents('.aside').length) {
                this.removeFloatingNav();
                $doc.off('click.sidebar');
            }
        });
    }

    removeFloatingNav() {
        $('.nav-floating').remove();
    }

    isSidebarCollapsed() {
        return this.settings.layout.isCollapsed;
    }
    isSidebarCollapsedText() {
        return this.settings.layout.isCollapsedText;
    }
    isEnabledHover() {
        return this.settings.layout.asideHover;
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
