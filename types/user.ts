import { Request,Response } from "express"

export interface UserBody {
    body: {
    name:string,
    email:string,
    role: string,
    password:string,
    }

} 
export interface  ReqMid extends Request{
    file: any
    user:{
        id:number,
        name:string,
        email:string,
        role: string,
        file: string,
        password:string,
    }
    token: string
}
export interface Token {
    
}
