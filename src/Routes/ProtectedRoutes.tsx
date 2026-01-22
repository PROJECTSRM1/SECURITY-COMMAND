import { useEffect} from "react"
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../utils/helpers/storage";

export const ProtectedRoutes = (prop:any) =>{
     const navigate = useNavigate()
    
        useEffect(()=>{
            let userData:any = getUserDetails('userData')
                
            if(userData != null){
                navigate('/app/dashboard')
            }else{
                navigate('/login')
            }
    
        },[])
        

    return <>{prop.children}</>
}