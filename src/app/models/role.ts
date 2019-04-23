export class Role {
	constructor(
			public id: number,
			public name: string,
			public rolemapping:number
	){}
}

export class RoleMapping{
	constructor(
		id:number,
		principalId:number,
		roleId:number
  ){}
}