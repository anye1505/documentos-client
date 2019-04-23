import {Request, Response} from '@angular/http';
import {Observable, Subscriber} from 'rxjs';
import {Resource} from 'ngx-resource';
 

export class Rest extends Resource {
 
  //private deferredQ: Subscriber<any>[] = [];
  //private configListenerSet: boolean = false;
 
  $getHeaders(methodOptions?: any): any {
      //const headers: any = {};
    let headers = super.$getHeaders();
    //headers.Accept = 'application/json';
    if (methodOptions.auth) {
      headers.Authorization = localStorage.getItem('token');
    }
    return headers;
  }

  /*
  
  $requestInterceptor( request: Request, methodOptions?: any): Request {
      //this.http.
      console.log("en el interceptop");
      return request;
  });*/
  
  $responseInterceptor(observable: Observable<any>, request: Request, methodOptions: any): Observable<any> { 

    return Observable.create((subscriber: Subscriber<any>) => { 
      observable.subscribe(
        (res: Response) => {
          if (res.headers) {
            //console.log(res);
            //console.log("despues de la consulta");
            //let newToken: string = res.headers.get('X-AUTH-TOKEN');
            //if (newToken) {
              //AuthServiceHelper.token = newToken;
              //localStorage.setItem('token', newToken);
            //}
          }
          subscriber.next((<any>res)._body ? res.json() : null);
        },
        (error: Response) => {
            //subscriber.error(new Error(error.statusText));
          //console.log("error despues de la consulta");
          //console.log(error  );
          //if (error.status === 401) {
            //AuthServiceHelper.token = null;
            //localStorage.setItem('token', newToken);
          //}
          //console.warn('BaseResource request error', error, request);
          subscriber.error(error);
        },
        () => subscriber.complete()
      );
 
    });
  }
  
 
}