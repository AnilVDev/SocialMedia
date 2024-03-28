import React, { useState,useEffect } from "react";
import '@fortawesome/fontawesome-free/css/all.css';
import '../style.css'
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify'
import { resetPasswordConfirm,reset } from "../../../Slice/authSlice";
import Spinner from "../../../components/Spinner";

function ForgotPasswordConfirm() {
  const { uid, token } = useParams()
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [state, setState] = useState({
    new_password: "",
    re_new_password: ""
});
  const { new_password, re_new_password } = state;

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    if (isError) {
        toast.error(message)
      }
  
      if (isSuccess) {
        navigate('/login')
        toast.success("Your password was reset successfully.")
      }
      dispatch(reset())
  }, [isError, isSuccess,navigate, dispatch])

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
        uid,
        token,
        new_password,
        re_new_password,
    }

    dispatch(resetPasswordConfirm(userData))
  };

  return (

    <div className="App">
      <h2>Connect You</h2>
      <div className='container' id="container">

        <div className="form-container sign-in-container">
        <form onSubmit={handleOnSubmit}>
            <h1>New Password</h1>

            <span>Create </span>
            <input
            type="password"
            placeholder="password"
            name="new_password"
            value={state.new_password}
            onChange={handleChange}
            />
            <input
            type="password"
            name="re_new_password"
            placeholder="Confirm"
            value={state.re_new_password}
            onChange={handleChange}
            />
            
            <button>Submit</button>
        </form>
        </div>

        {isLoading && <Spinner/>}

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your new password</p>
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


  );
}

export default ForgotPasswordConfirm;
