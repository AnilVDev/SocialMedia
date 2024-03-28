import axios from 'axios'
// import jwtInterceptors from './jwtInterceptors';
// import createJwtInterceptors from './jwtInterceptors';



const API_URL =process.env.REACT_APP_API_URL;
const api ="http://127.0.0.1:8000/api/"




//Register user
const register = async (userData) => {
    const response = await axios.post(API_URL +'users/', userData)

    if(response.data){
        localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
}

//Login user
const login = async (userData) => {
    const response = await axios.post(API_URL +'jwt/create/',userData)

    if(response.data){
        localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
}

const logout = () => {
    localStorage.clear();
    localStorage.removeItem('user')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('adminUser')
}

//acivate user
const csrftoken = document.cookie.match(/csrftoken=([^ ;]*)/)[1];

const activate = async (userData) => {
    const config = {
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
        }
    };
    const response = await axios.post(`${process.env.REACT_APP_API_URL}users/activation/`, userData, config);

    return response.data
}


// Reset password
const resetPassword = async (userData) => {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}users/reset_password/`,userData)

    return response.data
}


//reset password confirm
const resetPasswordConfirm = async (userData) => {
    const config = {
        headers: {
            // 'X-CSRFToken': csrftoken,
            "Content-type": "application/json"
            
        }
    }
    const response = await axios.post(`${process.env.REACT_APP_API_URL}users/reset_password_confirm/`,userData,config)
    console.log(response.data)
    return response.data
}



//get user info
const getUserInfo = async(axiosInstance,accessToken) => {
    const config = {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    }
    const response = await axiosInstance.get(`${api}profile/`,config)
    if(response.data){
        localStorage.setItem('userInfo', JSON.stringify(response.data))
    }
    return response.data   
}



//update user info
const updateUserInfo = async(axiosInstance,formData,accessToken) => {
    
    console.log("updateUserInfo--service--")
    const config = {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data"
        }
    }
    console.log("data in service --**---",formData)
    
    const response = await axiosInstance.patch(`${api}update/`,formData,config)

    return response.data   
}

//update Token
const updateToken = async(refreshToken) => {

    console.log(refreshToken)
    const response = await axios.post(`${api}token/refresh/`,{refresh: refreshToken })
    if(response.data){
        localStorage.setItem('user', JSON.stringify(response.data))
    }
    console.log("new token",response.data)
    return response.data   
}


// refresAccess Token
const refreshAccessToken = async(refreshToken) => {

    console.log(refreshToken)
    const response = await axios.post(`${api}token/refresh/`,{refresh: refreshToken })
    if(response.data){
        localStorage.setItem('user', JSON.stringify(response.data))
    }
    console.log("new token",response.data)
    return response.data   
}

const authService = {
    register, login, logout, activate, resetPassword, resetPasswordConfirm, getUserInfo, updateUserInfo, updateToken, refreshAccessToken
}

export default authService