import { PreloadingStrategy, Route } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { UserService } from '../services/user.service';

import { NgxPermissionsService } from 'ngx-permissions';
export class AppCustomPreloader implements PreloadingStrategy {
  preload(route: Route, load: Function): Observable<any> {
    console.log("preload");
    return route.data && route.data.preload ? load() : of(null);
  }
}