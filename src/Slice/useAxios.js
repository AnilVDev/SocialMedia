import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import {jwtDecode} from 'jwt-decode';
import dayjs from 'dayjs';
import { updateToken } from './authSlice';

const baseURL = 'http://127.0.0.1:8000'

const useAxios = () => {

    const dispatch = useDispatch()
    const {user} = useSelector(state=>state.auth)

    const axiosInstance = axios.create({
        baseURL,
        headers:{Authorization: `Bearer ${user?.access}`}
    });

    axiosInstance.interceptors.request.use(async req => {
    
        const userToken = jwtDecode(user.access)
        // console.log("old access-",user.access)
        const isExpired = dayjs.unix(userToken.exp).diff(dayjs()) < 1; 
        // console.log("expiee --",isExpired)
    
        if(!isExpired) return req
    
        // const response = await axios.post(`${baseURL}/api/token/refresh/`, {
        //     refresh: authTokens.refresh
        //   });
    
        // localStorage.setItem('user', JSON.stringify(response.data))
        
        // setAuthTokens(response.data)
        // setUser(jwt_decode(response.data.access))
        // dispatch(updateToken())
        // console.log("new access-",user.access)
        // req.headers.Authorization = `Bearer ${user.access}`
        // return req

        try {
            const response = await dispatch(updateToken());
            console.log("-useAxios----",response)
            req.headers.Authorization = `Bearer ${response.payload.access}`;
            // console.log("new access-",response.payload.access)
            return req;
          } catch (error) { 
            console.error("Token refresh error:", error);
            throw error;
          }
    })
    
    return axiosInstance

}

export default useAxios