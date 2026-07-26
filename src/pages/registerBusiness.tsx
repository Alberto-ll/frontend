import '../static/css/registerBusiness.css'
import type { BusinessData } from '../types/businessType';
import { Navigate, useOutletContext, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '../components/Auth';
import { userService, localityService, businessService } from '../services';
import { errorHandler } from '../types/apiError';

interface Locality {
  id?: number;
  name: string;
  postal_code: number;
  province: string;
}

export function RegisterBusinessPage(){
    const [localidad, setLocalidad] = useState("")
    const [hasBusiness, setHasBusiness] = useState(false)
    const handleLocalityChange = (e:React.ChangeEvent<HTMLSelectElement>) => {
        setLocalidad(e.target.value);
     };

    const [loading, setLoading] = useState<boolean>(false);
    const [localities, setLocalities] = useState<Locality[]>([]);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();
    const { userData, isLoading } = useAuth();

    useEffect(() => {
        const previousBusiness = async () =>{
        try{
            setLoading(true)
            if (!userData?.id) return;
            const responseData = await userService.hasBusiness(userData.id);
            setHasBusiness(responseData.hasBusiness);
        }catch(error){
            showNotification('Error: ' + errorHandler(error), 'error')
            setLoading(false)
        }finally{
            setLoading(false)
        }
      }
      previousBusiness();
        const fetchLocalities = async () => {
          try {
            setLoading(true);
            const localityData = await localityService.getAll() as Locality[];
            setLocalities(localityData);
          } catch (err) {
            showNotification("Error al cargar localidades: " + errorHandler(err), "error")
          } finally {
            setLoading(false);
          }
        };
    
        fetchLocalities();
      }, [showNotification, userData]);

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if(!userData){
        return <Navigate to="/"/>
    }

    const ownerId = userData.id;

    if(userData.category == "business_owner"){
        alert("Usted ya tiene un negocio en su nombre")
        return <Navigate to="/"/> 
    }

    const create = async (business:BusinessData) =>{
        try{
            setLoading(true)
            await businessService.add(business as unknown as Record<string, unknown>)
            showNotification('Formulario enviado con éxito', 'success')
            navigate('/')
        }catch(error){
            showNotification('Error: ' + errorHandler(error), 'error')
            setLoading(false)
        }finally{
            setLoading(false)
        }
    }

    const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const locId = localities.find(loc => loc.name === String(formData.get("businessLocality")))?.id;
                if(locId){
                const business:BusinessData = {
                    address:String(formData.get("businessAdress")),
                    businessName:String(formData.get("businessName")),
                    reservationDepositPercentage:Number(formData.get("businessPercentage")),
                    averageRating:0,
                    locality:locId,
                    id:0,
                    owner:ownerId,
                    active:false,
                    openingAt:String(formData.get("businessOpen")),
                    closingAt:String(formData.get("businessClose"))
                }
                if(business && !hasBusiness) {
                    create(business);
                }
                if(hasBusiness){
                  showNotification('Ya hay una solicitud de negocio a tu nombre', 'warning')
                }
              }
        };

    return(
        <div className="registerMainContent">
            <h1 className='formTitle'>Registrar negocio</h1>
            <form className='registerForm' onSubmit={handleRegisterSubmit}>
                {!loading && <div className="inputs">
                    <div className='input'>
                        <label htmlFor="businessName">Nombre del negocio</label>
                        <input type='text' required id="businessName" name="businessName"/>
                    </div>
                    <div className='input'>
                        <label htmlFor='businessAdress'>Dirección del negocio</label>
                        <input type='text' required id="businessAdress" name="businessAdress"/>
                    </div>
                    <div className="input">
                    <label htmlFor="businessLocality">Localidad del negocio</label>
                    <select
                        required
                        id="businessLocality"
                        name="businessLocality"
                        onChange={handleLocalityChange}
                        value={localidad}>
                                <option value="">Selecciona una localidad</option>
                                {localities.length > 0 &&
                                localities.map((item, index) => (
                                    <option key={index} value={item.name}>{item.name}</option>
                                ))}
                            </select>
                    </div>
                    <div className='input'>
                        <label htmlFor="businessPercentage">Porcentaje de reserva</label>
                        <input type='number' required id="businessPercentage" step="0.01" name="businessPercentage" max={0.5} />
                    </div>
                    <div className='input'>
                          <label htmlFor='businessOpen'>Horario de apertura</label>
                          <input type='time' required id="businessOpen" name="businessOpen"/>
                        </div>
                        <div className='input'>
                          <label htmlFor='businessClose'>Horario de cierre</label>
                          <input type='time' required id="businessClose" name="businessClose"/>
                        </div>
                </div>}
                {loading && <div>Cargando...</div>}
                <div className="submit">
                    <button type="button" className="secondary">Cancelar</button>
                    <button type="submit" className="primary">Enviar formulario</button>
                </div>
            </form>
        </div>
    )
}
