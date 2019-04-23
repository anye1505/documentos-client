export class Guia{
	constructor(
		public operador_id: number,
		public gui_id: number,
        public gui_numero: number,
        public suc_id: number,
        public sam_id: number,
        public men_id: number,
        public gue_id: number,
        public gui_fecha_creacion: Date,
        public gui_usuario_crea: number,
        public gui_usuario_modifica: number,
        public gui_fecha_modifica: Date,
        public gui_fecha_entrega: Date,
        public gui_usuario_entrega: number,
        public gui_fecha_cierre: Date,
        public gui_nro_docs: number,
        public gui_nro_docs_cerrado: number,
        public gui_nro_docs_pendiente: number,
        public gui_pasaje: number,
        public gui_fecha_eliminado: Date,
        public gui_usuario_elimina: number
	){}
}