export class Empresa {
  constructor(
      public emp_id: number,
      public emp_ruc: number, 
      public emp_razon_social: string,
      public emp_tipo: string, 
      public emp_abrev:string, 
      public emp_direccion:string, 
      public emp_telefono:string, 
      public emp_logotipo:string, 
      public emp_ubigeo:number, 
      public emp_representante:string, 
      public emp_email:string
  ){}
}
