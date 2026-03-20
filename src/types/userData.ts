import type { Category } from "./categoryType"

export type UserData = {
    email:string,
    password?:string,
    name?:string,
    category?:string | Category,
    surname?:string,
    phoneNumber?:string | null,
    id?:number,
    exp?:number,
    createdAt?: string,
    updatedAt?: string
}

