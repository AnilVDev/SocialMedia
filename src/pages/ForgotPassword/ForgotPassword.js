import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { resetPassword } from '../../Slice/authSlice'

function ForgotPassword() {

        const [formData,setFormData]= useState({
            email:""
        })
    
        const { email } = formData
    
        const dispatch = useDispatch()
        const navigate = useNavigate()
    
        const { isLoading, isError, isSuccess, message } = useSelector(state => state.auth)
    
        const handleChange = e =>{
            setFormData((prev) => ({
                ...prev,
                [e.target.name]:e.target.value
            }))
        }
    
        const handleSubmit = e =>{
        e.preventDefault()
        const userData ={ email }
    
        dispatch(resetPassword(userData))
        }   
        
        useEffect(() =>{
            if(isError){
                toast.error(message)
            }
            if(isSuccess){
                navigate('/login')
                toast.success('A reset password email has been sent to you')
            }
        }, [ isError, isSuccess, message, navigate, dispatch])
    
      return (
        <div className="App">
                <h2>Connect You</h2>
                <div className='container' id="container">
          
                  <div className="form-container sign-in-container" >
                    <form>
    
                      <h1>Reset Password</h1>
    
                      <span>confirm your gmail to reset password</span>
                    </form>
    
                  </div>
          
                  <div className="overlay-container">

    
                    <div className="overlay">
                      <div className="overlay-panel overlay-right">
                        <h1>Click here</h1>
                        <input type="text"
                            placeholder="email"
                            name="email"
                            onChange={handleChange}
                            value={email}
                            required
                        />
                     <button className="btn" style={{height:'40px',marginTop:'5px',backgroundColor:'black'}} type="submit" onClick={handleSubmit}>Submit </button>
                        
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
    
  )
}

export default ForgotPassword