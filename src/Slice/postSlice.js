import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postService from './postService';
import axios from 'axios';


const graphqlUrl = "http://http://127.0.0.1:8000/graphql/"

const initialState = {
    userBio:null,
    userPost:{},
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
  }; 
  

  // get user bio
  export const getBio = createAsyncThunk('post/getBio',
    async (axiosInstance,thunkAPI) => {
      const query = `
      query {
        user {
          firstName
          lastName
          username
          profilePicture
          bio
        }
        }`;
        try {
          const accessToken = thunkAPI.getState().auth.user.access
          console.log('g e t b i o',accessToken)
          if (!accessToken) {
            return thunkAPI.rejectWithValue('Access token is missing');
          }
            const response = await postService.getBio(axiosInstance, {query}, accessToken)
            if (!response) {
                return thunkAPI.rejectWithValue('Failed to get your info');
              }
              return response
        }catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            console.log("get User details graph --**-",error.response, error.response.data, error.response.data.message, error.message)
            return thunkAPI.rejectWithValue(message);         
        }
    }
  )


  // // create new post
  // export const createPost = createAsyncThunk('post/createPost',
  //   async({axiosInstance,formData}, thunkAPI) => {
  //     try {
  //     console.log("create po st  * * ")
  //     const description = formData.get('description');
  //     const privacySettings = formData.get('privacy_settings');
  //     const dateOfMemory = formData.get('date_of_memory');
  //     const filesArray = Array.from(formData.getAll('media'))
  //     const mutation = `
  //     mutation {
  //       createPost(
  //         description: "${description}", 
  //         privacySettings: ${privacySettings}, 
  //         dateOfMemory: "${dateOfMemory}", 
  //         media: [${filesArray.map(file => `{ name: "${file.name}" }`).join(",")}]
  //       ) {
  //         post {
  //           description
  //           privacySettings
  //           dateOfMemory
  //         }
  //       }
  //     }`;

  //       const accessToken = thunkAPI.getState().auth.user.access
  //       console.log('create * * post',accessToken,mutation)
  //       if(!accessToken){
  //         return thunkAPI.rejectWithValue('Access token is missing');
  //       }
  //       const response = await postService.createPost(axiosInstance, {  mutation }, accessToken)
  //       if(!response){
  //         return thunkAPI.rejectWithValue('Failed to create your post')
  //       }
  //       return response
  //     }catch(error){
  //       const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
  //       return thunkAPI.rejectWithValue(message)
  //     }
  //   }
  // )

  export const postSlice = createSlice({
    name: 'post',
    initialState,
    reducers : {
        resetPost: (state) => {
            state.isLoading = false,
            state.isSuccess = false,
            state.isError = false,
            state.message = ''
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(getBio.pending, (state) => {
            state.isLoading = true
        })
        .addCase(getBio.fulfilled, (state,action) => {
            state.isLoading = false,
            state.isSuccess = true,
            state.userBio = action.payload.data.user
        })
        .addCase(getBio.rejected, (state,action) => {
            state.isLoading = false,
            state.isError = true,
            state.message = action.payload,
            state.userBio = null
          })
        //   .addCase(createPost.pending, (state) => {
        //     state.isLoading = true
        // })
        // .addCase(createPost.fulfilled, (state,action) => {
        //     state.isLoading = false,
        //     state.isSuccess = true,
        //     state.message = action.payload
        // })
        // .addCase(createPost.rejected, (state,action) => {
        //     state.isLoading = false,
        //     state.isError = true,
        //     state.message = action.payload,
        //     state.userBio = null
        //   })
    }
  })


  export const {resetPost} = postSlice.actions
  export default postSlice.reducer