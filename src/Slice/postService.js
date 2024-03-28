import axios from 'axios';
import { postSlice } from './postSlice';

const graphqlUrl = "http://127.0.0.1:8000/graphql/"


// get user bio
const getBio = async (axiosInstance,{query},accessToken) => {
    console.log('servi g e t b i o')
    const config = {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    }
    const response = await axiosInstance.post(graphqlUrl,{query},config)
    return response.data
}

// create new post
const createPost = async (axiosInstance,{mutation},accessToken) => {
    console.log('servi create post **')
    const config = {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    }
    console.log("E R RO R ")
    const response = await axiosInstance.post(graphqlUrl,{mutation},config)
    return response.data
}


const postService = {
    getBio,createPost
}

export default postService