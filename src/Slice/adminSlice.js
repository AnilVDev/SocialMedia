// authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from './adminService';

const apiUrl = "http://localhost:8000/authenticate/";

//get admin from local storage
const adminUser = JSON.parse(localStorage.getItem('adminUser'))
const userList = JSON.parse(localStorage.getItem('userList'))

const initialState = {
  adminUser: adminUser? adminUser:null,
  adminUserInfo:{},
  userList:userList? userList:{},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
}; 






//Login AdminUser
export const adminlogin = createAsyncThunk('admin/adminlogin', async(user,thunkAPI) =>{
  try{
    return await adminService.adminlogin(user)
  }catch(error){
    let errorMessage = 'An error occurred while SignIn.';
      
    if (error.response && error.response.status === 401) {
      const responseData = error.response.data;
      if (responseData) {
        if (responseData.detail) {
          errorMessage = responseData.detail;
        }   
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
      return thunkAPI.rejectWithValue(errorMessage) 
  }
})


//Logout user
export const logout = createAsyncThunk('auth/logout', async () =>{
  await adminService.logout()
})



// get user data
export const getUserList = createAsyncThunk('admin/getUserList', async(_, thunkAPI) => {
  try{
    const accessToken = thunkAPI.getState().admin.adminUser.access_token
    return await adminService.getUserList(accessToken);
  }catch (error){
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    console.log(message)
    return thunkAPI.rejectWithValue(message);    
  }
})

// updateStatus
// export const updateStatus = createAsyncThunk('auth/updateStatus', async(requestData, thunkAPI) => {
//   try{
//     const accessToken = thunkAPI.getState().auth.user.access
//     return await authService.updateStatus(requestData, accessToken);
//   }catch (error){
//     const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
//     console.log("getuser details",error.response, error.response.data, error.response.data.message, error.message)
//     return thunkAPI.rejectWithValue(message);    
//   }
// })
export const updateStatus = createAsyncThunk('auth/updateStatus', async(requestData, thunkAPI) => {
  try{
    const accessToken = thunkAPI.getState().admin.adminUser.access_token
    console.log("update-",accessToken)
    return await adminService.updateStatus(requestData, accessToken);
  } catch (error) {
    if (error.response && error.response.data) {
      const message = error.response.data.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    } else {
      const message = error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
})


export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    reset:(state) => {
      state.isLoading = false,
      state.isSuccess = false,
      state.isError = false,
      state.message = ''
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(adminlogin.pending, (state) => {
      state.isLoading = true
    })
    .addCase(adminlogin.fulfilled, (state,action) =>{
      state.isLoading = false
      state.isSuccess = true
      state.adminUser = action.payload
      state.message = action.payload.message
    })
    .addCase(adminlogin.rejected, (state, action) => {
      state.isLoading = false
      state.isError = true
      state.message = action.payload
      state.adminUser = null
    })
    .addCase(logout.fulfilled, (state) => {
      state.adminUser = null
    })
    .addCase(getUserList.pending, (state) => {
      state.isLoading = true
    })    
    .addCase(getUserList.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccess = true
      state.userList = action.payload
      state.message = action.payload.message
    })
    .addCase(getUserList.rejected, (state, action) => {
      state.isLoading = false
      state.isError = true
      state.message = action.payload
      state.adminUserInfo = null
    })
    .addCase(updateStatus.pending, (state) => {
      state.isLoading = true
    })    
    .addCase(updateStatus.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccess = true
      state.message = action.payload.message
    })
    .addCase(updateStatus.rejected, (state, action) => {
      state.isLoading = false
      state.isError = true
      state.message = action.payload
      state.adminUserInfo = null
    })
  },
});


export const {reset} = adminSlice.actions
export default adminSlice.reducer;
 