export class User {
	constructor(
			public id: number,
			public username: string, 
			public name: string, 
			public surname: string,
			public email: string, 
			public password:string, 
			public realm:string
	){}
}


export class UserCreate{
	constructor(
			public username: string, 
			public name: string, 
			public surname: string,
			public email: string, 
			public password:string, 
			public realm:string,
			public suc_id:number,
			public emp_id:number
	){}
}


export class UserEdit {
	constructor(
		public id:number,
		public name: string, 
		public surname: string,
		public suc_id:number,
		public emp_id:number
	){
    	
	}
}

export class UserResetPassword{
	constructor(
		public id:number,
		public password:string, 
	){

	}
}


export class Login{
	constructor(
		public email:string,
		public password: string,
		public realm: string,
		public ttl:number
	){

	}
}