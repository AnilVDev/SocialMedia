// import axios from "axios";

// const api ="http://127.0.0.1:8000/api/"

// const jwtInterceptors = axios.create({});

// jwtInterceptors.interceptors.response.use(
//     (response) =>{
//         console.log("success")
//         return response;
//     },
//     async (error) =>{
//         if (error.response.status === 401){

//             const user = JSON.parse(localStorage.getItem('user'))

//             const response = await axios.post(`${api}token/refresh/`,{refresh: user.refresh })
//             user.access = response.data.access
//             localStorage.setItem('user', JSON.stringify(user))
//             .catch((refreshTokenAPIError) =>{
//                 console.log('removing ---')
//                 localStorage.removeItem("user");
//                 return Promise.reject(refreshTokenAPIError)
//             })

//             return axios(error.config)
//         }
//         return Promise.reject(error)
//     }
// )

// export default jwtInterceptors

import axios from "axios";
import { refreshAccessToken, reset } from "./authSlice";
import { useDispatch } from "react-redux";


const api ="http://127.0.0.1:8000/api/"

const createJwtInterceptors = () => {
    const jwtInterceptors = axios.create({});
    const dispatch = useDispatch();

    jwtInterceptors.interceptors.response.use(
    (response) => {
        console.log("success")
        return response;
    },
    async (error) => {
        console.log("failed")
        if (error.response.status === 401) {
        try {
        
            const newAccessToken = await dispatch(refreshAccessToken());
            error.config.headers.Authorization = `Bearer ${newAccessToken.access}`;
            // localStorage.setItem('user', JSON.stringify(newAccessToken))
            return axios(error.config); 
        } catch (refreshError) {
            console.error('Refresh token failed:', refreshError);
            localStorage.removeItem('user');
            // dispatch(reset());
            return Promise.reject(refreshError);
        }
        }
        return Promise.reject(error);
    }
    );

    return jwtInterceptors;
};

export default createJwtInterceptors;