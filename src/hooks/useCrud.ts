import { useEffect, useState } from "react";
import { errorHandler } from "../types/apiError";

export function useCrud<T, Args extends unknown[] = []>(serviceMethod : (...args: Args) => Promise<T>, options={manual : false}){
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const execute = async (...args: Args) => {
        setLoading(true)
        try{
            setError(null)
            const result = await serviceMethod(...args)
            setData(result)
            return
        }catch(err : unknown){
            setError(errorHandler(err))
            throw err
        }finally{
            setLoading(false)
        }
    }

    useEffect(() => { 
        if(!options.manual){
            execute(...([] as unknown as Args)).catch(() => {})
        }
    }, [])

    return {data, loading, error, execute}
}