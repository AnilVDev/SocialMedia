import React, { useEffect, useState } from 'react'
import '@fortawesome/fontawesome-free/css/all.css';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify'
import { Link } from "react-router-dom";
import "./index.css"
import { adminlogin,reset } from '../../Slice/adminSlice';

function AdminLogin() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
  
    const [state, setState] = useState({
      email: "",
      password: ""
  });
    const { email, password } = state;
  
    const { user, isLoading, isError, isSuccess, message } = useSelector(
      (state) => state.admin
    )
  
    useEffect(() => {
    //   if (isError) {
    //       toast.error(message)
    //     }
    
        if (isSuccess && message=="superuser") {
          navigate('/dashboard')
        }
        else{
            toast.error(message) 
        }
        dispatch(reset())
        // dispatch(getUserInfo())
    }, [user, isError, isSuccess, message, navigate, dispatch])
  
    const handleChange = evt => {
      const value = evt.target.value;
      setState({
        ...state,
        [evt.target.name]: value
      });
    };
  
    const handleOnSubmit = evt => {
      evt.preventDefault();
  
      const userData = {
          email,
          password,
      }
  
      dispatch(adminlogin(userData))
    };


  return (
    <div className="App">
      <h2>Admin login</h2>
      <div className='container' id="container">

        <div className="form-container sign-in-container">
        <form onSubmit={handleOnSubmit}>
            <h1>Sign in</h1>
            <div className="social-container">
            <a href="#" className="social">
                <i className="fab fa-facebook-f" />
            </a>
            <a href="#" className="social">
                <i className="fab fa-google-plus-g" />
            </a>
            <a href="#" className="social">
                <i className="fab fa-linkedin-in" />
            </a>
            </div>
            <span>or use your account</span>
            <input
            type="email"
            placeholder="Email"
            name="email"
            value={state.email}
            onChange={handleChange}
            />
            <input
            type="password"
            name="password"
            placeholder="Password"
            value={state.password}
            onChange={handleChange}
            />
            <p><Link to="/forgot-password">Forgot your password?</Link></p>
            <button>Sign In</button>
        </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button
                className="ghost "
                id="signUp"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}

export default AdminLogin



