import { Component, OnInit } from '@angular/core';

import { UserblockService } from './userblock.service';

import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-userblock',
    templateUrl: './userblock.component.html',
    styleUrls: ['./userblock.component.scss']
})
export class UserblockComponent implements OnInit {
    user: any;
    constructor(
        public userblockService: UserblockService,
        private _authService:AuthService) {

        let identity = this._authService.getIdentity();
        if(identity!=null){            
            this.user = {
                picture: 'assets/img/user/user.png',
                name:identity.name,
                surname:identity.surname
            };            
        }

    }

    ngOnInit() {
    }

    userBlockIsVisible() {
        return this.userblockService.getVisibility();
    }

}
