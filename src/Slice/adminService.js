import axios from 'axios'



const API_URL ='http://127.0.0.1:8000/api/';



//Login user
const adminlogin = async (userData) => {
    const response = await axios.post(`${API_URL}authenticate/`,userData)

    if(response.data){
        localStorage.setItem('adminUser', JSON.stringify(response.data))
    }
    return response.data
}

const logout = () => {
    localStorage.removeItem('adminUser')
    localStorage.removeItem('user')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('adminUserInfo')
    localStorage.clear();
}







//get user info
const getUserList = async(accessToken) => {
    const config = {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    }
    console.log(`${API_URL}api/userlist/`)

    const response = await axios.get(`${API_URL}userlist/`,config)

    return response.data   
}

//updateStatus
const updateStatus = async(requestData,accessToken) => {
    const config = {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            // "Content-Type": "multipart/form-data"
        }
    }
     console.log("api-",requestData,config)
    const response = await axios.put(`${API_URL}update-status/`,requestData,config)
    return response.data   
}

const adminService = {
    adminlogin, logout, getUserList,updateStatus
}

export default adminService