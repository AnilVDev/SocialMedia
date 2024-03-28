import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {  activate, reset } from '../../Slice/authSlice';
import { toast } from 'react-toastify'
import Spinner from '../../components/Spinner';
import "../Login-SignUp/style.css";


function AccountVerification() {  
    
        const { uid, token } = useParams()
        console.log("UID:", uid);
        const dispatch = useDispatch()
        const navigate = useNavigate()
    
        const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)
    
        const handleSubmit = (e) => {
            e.preventDefault()
    
            const userData = {
                uid,
                token
            }
            dispatch(activate(userData))
          }
          
          useEffect(() => {
            if (isError) {
              toast.error(message)
            }
            
            if (isSuccess) {            
                toast.success("Your account has been activated! You can login now")
                navigate("/login")
            }
    
            dispatch(reset())
    
        }, [isError, isSuccess])
    
    
        return (
            
            <div className="App">
            <h2>Connect You</h2>
            <div className='container' id="container">
      
              <div className="form-container sign-in-container" >
                <form>

                  <h1>Activate Your Account</h1>

                  <span>by clicking activate buttton you activate your account</span>
                </form>

              </div>
      
              <div className="overlay-container">
                <div className="overlay">
                  <div className="overlay-panel overlay-right">
                    <h1>Click here</h1>
            <button className="btn" style={{height:'40px',marginTop:'5px',backgroundColor:'black'}} type="submit" onClick={handleSubmit}>Activate </button>
                    
                    

            {/* {isLoading && <Spinner/> } */}

                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
   


export default AccountVerification;
