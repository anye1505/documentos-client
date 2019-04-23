export class GuiaDespacho{
	constructor(
		public operador_id: number,
		public gud_id: number,
        public gud_numero: number,
        public suc_id: number,
        public suc_destino_id: number,
        public tra_id: number,
        public gde_id: number,
        public gud_fecha_creacion: Date,
        public gud_usuario_crea: number,
        public gud_usuario_modifica: number,
        public gud_fecha_modifica: Date,
        public gud_fecha_despacho: Date,
        public gud_usuario_despacho: number,
        public gud_fecha_recepcion: Date,
        public gud_nro_docs: number,
        public gud_nro_docs_recibido: number,
        public gud_nro_docs_pendiente: number,
        public gud_fecha_eliminado: Date,
        public gud_usuario_elimina: number
	){}
}