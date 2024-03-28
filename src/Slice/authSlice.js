 // authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';

const apiUrl = "http://localhost:8000/api/";

//get user from local storage
const user = JSON.parse(localStorage.getItem('user'))
const userInfo = JSON.parse(localStorage.getItem('userInfo'))

const initialState = {
  user:user? user:null,
  userInfo:userInfo?userInfo:{},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
}; 


// Register user
export const register = createAsyncThunk('auth/register',
  async (user, thunkAPI) => {
    try {
        return await authService.register(user)
    } catch (error) {
      let errorMessage = 'An error occurred while registering the user.';
      
      if (error.response && error.response.status === 400) {
        const responseData = error.response.data;
        if (responseData) {
          if (responseData.username) {
            errorMessage = responseData.username[0];
          } else if (responseData.email) {
            errorMessage = responseData.email[0];
          }else if (responseData.password) { 
            errorMessage = responseData.password[0];
        }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error(errorMessage); 
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);



//Login user
export const login = createAsyncThunk('auth/login', async(user,thunkAPI) =>{
  try{
    return await authService.login(user)
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
  await authService.logout()
})

//verify user
export const activate = createAsyncThunk('auth/activate', async (userData, thunkAPI) => {
  try {
    await authService.activate(userData);
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    console.log(error.response,error.response.data,error.response.data.message,error.message)
    return thunkAPI.rejectWithValue(message);
  }
});

//reset password
export const resetPassword = createAsyncThunk('auth/resetPassword', async(userData, thunkAPI) => {
  try{
    return await authService.resetPassword(userData)
  }catch(error){
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
})

//reset password confirm
export const resetPasswordConfirm = createAsyncThunk('auth/resetPasswordConfirm', async (userData, thunkAPI) => {
  try {
    await authService.resetPasswordConfirm(userData);
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// get user data
export const getUserInfo = createAsyncThunk('auth/getUserInfo', async(axiosInstance, thunkAPI) => {
  try{
    const accessToken = thunkAPI.getState().auth.user.access
    return await authService.getUserInfo(axiosInstance,accessToken);
  }catch (error){
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);    
  }
})

//userdetails update
export const updateUserInfo = createAsyncThunk('auth/updateUserInfo', async({axiosInstance,formData}, thunkAPI) => {
  try{
    const accessToken = thunkAPI.getState().auth.user.access
    if (!accessToken) {
      return thunkAPI.rejectWithValue('Access token is missing');
    }
    const response = await authService.updateUserInfo(axiosInstance,formData, accessToken);
    if (!response) {
      return thunkAPI.rejectWithValue('Failed to update user info');
    }
    console.log(response,response.data)
    return response.data;
  }catch (error){
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    console.log("updateUser details--**-",error.response, error.response.data, error.response.data.message, error.message)
    return thunkAPI.rejectWithValue(message);    
  }
})

//update Token
export const updateToken = createAsyncThunk('auth/updateToken', async(_, thunkAPI) => {
  try{
    const refreshToken = thunkAPI.getState().auth.user.refresh
    console.log("refresh in slice --",refreshToken)
    return await authService.updateToken(refreshToken);
  }catch (error){
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    console.log("update token",error.response, error.response.data, error.response.data.message, error.message)
    return thunkAPI.rejectWithValue(message);    
  }
})

// refreshAccess Token
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const user = state.auth.user;

    if (!user || !user.refresh) {
      return thunkAPI.rejectWithValue('Missing user or refresh token');
    }

    try {
      const response = await authService.refreshAccessToken(user.refresh);
      return response.data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message || error.message); // Handle refresh errors
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
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
    .addCase(register.pending, (state) => {
      state.isLoading = true
    })
    .addCase(register.fulfilled, (state,action) => {
      state.isLoading = false,
      state.isSuccess = true,
      state.user = action.payload
    })
    .addCase(register.rejected, (state,action) => {
      state.isLoading = false,
      state.isError = true,
      state.message = action.payload,
      state.user = null
    })
    .addCase(login.pending, (state) => {
      state.isLoading = true
    })
    .addCase(login.fulfilled, (state,action) =>{
      state.isLoading = false
      state.isSuccess = true
      state.user = action.payload
    })
    .addCase(login.rejected, (state, action) => {
      state.isLoading = false
      state.isError = true
      state.message = action.payload
      state.user = null
    })
    .addCase(logout.fulfilled, (state) => {
      state.user = null
    })
    .addCase(activate.pending, (state) => {
      state.isLoading = true
    })
    .addCase(activate.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccess = true
      state.user = action.payload
    })
    .addCase(activate.rejected, (state, action) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = true
      state.message = action.payload
      state.user = null
    })
    .addCase(resetPassword.pending, (state) => {
      state.isLoading = true
    })
    .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false
        state.isSuccess = true
    })
    .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = action.payload
        state.user = null
    })
    .addCase(resetPasswordConfirm.pending, (state) => {
      state.isLoading = true
    })
    .addCase(resetPasswordConfirm.fulfilled, (state) => {
        state.isLoading = false
        state.isSuccess = true
    })
    .addCase(resetPasswordConfirm.rejected, (state, action) => {
        state.isLoading = false
        state.isSuccess = false
        state.isError = true
        state.message = action.payload
        state.user = null
    })
    .addCase(getUserInfo.fulfilled, (state, action) => {
      state.userInfo = action.payload
    })
    .addCase(updateUserInfo.pending, (state) => {
      state.isLoading = true
    })
    .addCase(updateUserInfo.fulfilled, (state,action) =>{
      state.isLoading = false
      state.isSuccess = true
      state.userInfo = action.payload
    })
    .addCase(updateUserInfo.rejected, (state, action) => {
      state.isLoading = false
      state.isError = true
      state.message = action.payload
    })
    .addCase(updateToken.pending, (state) => {
      state.isLoading = true
    })
    .addCase(updateToken.fulfilled, (state,action) =>{
      state.isLoading = false
      state.isSuccess = true
      state.user.access = action.payload.access
    })
    .addCase(updateToken.rejected, (state, action) => {
      state.isLoading = false
      state.isError = true
      state.message = action.payload
      state.user = null
    })
    .addCase(refreshAccessToken.pending, (state) => {
      state.isLoading = true
    })
    .addCase(refreshAccessToken.fulfilled, (state,action) =>{
      state.isLoading = false
      state.isSuccess = true
      state.user.access = action.payload
    })
    .addCase(refreshAccessToken.rejected, (state, action) => {
      state.isLoading = false
      state.isError = true
      state.message = action.payload
      state.user = null
    })
  },
});


export const {reset} = authSlice.actions
export default authSlice.reducer;
 