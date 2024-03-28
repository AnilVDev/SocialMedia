import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";



const ProtectedRoute =({children}) =>{
    const {user} = useSelector(state =>state.auth)
    const {adminUser} = useSelector(state => state.admin)

    if(user){
         
        return children;
    }else if(adminUser){
        return children;
    }
    else{
        return <Navigate to ='/login' />
    }
}
export default ProtectedRoute