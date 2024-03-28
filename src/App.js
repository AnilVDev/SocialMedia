

import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route,createBrowserRouter } from "react-router-dom";
import SignInForm from './pages/Login-SignUp/SignInForm';
import SignUpForm from './pages/Login-SignUp/SignUpForm';
import { Provider } from 'react-redux';
import { store } from './Store/store';
import AccountVerification from './pages/AccountVerification/AccountVerification';
import ForgotPasswordConfirm from './pages/Login-SignUp/ForgotPasswordConfirm/ForgotPasswordConfirm';
import  Dashboard  from './pages/Admin/Dashboard';
import AdminLogin from './components/Admin/AdminLogin';
import ProtectedRoute from './ProtectedRoute';
import PageContent from './components/Admin/PageContent';
import DashHeader from './components/Admin/DashHeader';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import MainRouter from './routes/MainRouter';





function App() {



  return (
   
      <Provider store={store}>
           
        <BrowserRouter>
          <Routes>            
            <Route path='/*' element ={ 
              <ProtectedRoute> <MainRouter/> </ProtectedRoute>
            }/>
            <Route path="/login" element={<SignInForm />} />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path='/forgot-password' element={<ForgotPassword />}/>
            <Route path="/activate/:uid/:token" element={<AccountVerification/>} />
            <Route path="/password/reset/confirm/:uid/:token" element={<ForgotPasswordConfirm/>}/>
            <Route path = "/admin-login" element={<AdminLogin/>}/>
            {/* <Route path = "/dashboard" element={
              <ProtectedRoute>
                <Dashboard/>
              </ProtectedRoute>
            }/> */}
            {/* <Route path="/media/*" element={<MediaHandler />} /> */}
          </Routes>
          <ToastContainer />
        </BrowserRouter>          
      </Provider>
    
  );
}

const MediaHandler = () => {
  window.location.replace(window.location.href);
  return null; 
};


export default App;
