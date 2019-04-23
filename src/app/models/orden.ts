export class Orden {
	constructor(
			public ord_id: number,
			public spr_id: number, 
			public conf_id: number, 
			public pro_corte: string,
			public pro_nombre_archivo_in: string, 
			public pro_nombre_archivo_out:string, 
			public pro_fecha_inicio_ord:string, 
			public pro_fecha_fin_ord:string, 
			public pro_fecha_spr:string, 
			public pro_usuario_spr:string, 
			public pro_nro_docs:number, 
			public pro_nro_con_ubigeo:number, 
			public pro_nro_sin_ubigeo:number, 
			public pro_fecha_fin_ftp_envio:string, 
			public pro_nro_orden_courier:number, 
			public pro_fecha_op_courier:string, 
			public pro_estado:number, 
			public pro_temporal:string, 
			public pro_tipo:number
	){}
}

export class Consumo{
	constructor(
		public operador_id: number,
		public operador_nombre: string,
		public mes: number,
		public unidad: string,
		public tipo: string,
		public procesos_cantidad: number,
		public doc_cantidad: number,
		public doc_sin_ubigeo: number,
		public por_sin_ubigeo: number,
		public doc_con_ubigeo: number,
		public por_con_ubigeo: number
	){}
}