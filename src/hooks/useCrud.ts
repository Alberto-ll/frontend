import { useEffect, useState } from "react";

export function useCrud<T>(serviceMethod : () => Promise<T>, options={manual : false}){
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const execute = async () => {
        setLoading(true)
        try{
            setError(null)
            const result = await serviceMethod()
            setData(result)
        }catch(err : unknown){
            if (err instanceof Error) {
                setError(err.message);
            } 
            else if (typeof err === "string") {
                setError(err);
            } 
            else {
                setError("Ocurrió un error inesperado");
            }
        }finally{
            setLoading(false)
        }
    }

    useEffect(() => { 
        if(!options.manual){
            execute()
        }
    }, [])

    return {data, loading, error, execute}
}