import { Avatar, Box, Button, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUserInfo, reset, updateUserInfo } from '../Slice/authSlice';
import { Option } from '@mui/base';
import { toast } from 'react-toastify';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import useAxios from '../Slice/useAxios';
import { useNavigate } from 'react-router';
const { URL } = window;


function MyAccount() {

  const { user,userInfo, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

    const dispatch = useDispatch();
    const [updatedUserInfo, setUpdatedUserInfo] = useState({ ...userInfo || {} });
    const [imageUrl, setImageUrl] = useState(userInfo?.profile_picture || "");
    const navigate = useNavigate()
       
    const axiosInstance = useAxios(user?.access);

    useEffect(() => {
      if (isError) {
        toast.error(message)
        dispatch(reset())
      }    
      if (isSuccess) {            
        toast.success("Your profile is updated")
        dispatch(reset())
        navigate('/profile')
      }
      if (isError || isSuccess) {
        dispatch(getUserInfo(axiosInstance));
      }
    }, [isError, isSuccess, message, dispatch])    

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        const updatedUser = { ...updatedUserInfo, [id]: value };
        const filteredUser = Object.fromEntries(Object.entries(updatedUser).filter(([key, val]) => val !== undefined));
        setUpdatedUserInfo(filteredUser);
    };


    const handleFileChange = (e) => {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImageUrl(imageUrl);
      setUpdatedUserInfo({ ...updatedUserInfo, profile_picture: file });
    };



    const VisuallyHiddenInput = styled('input')({
      clip: 'rect(0 0 0 0)',
      clipPath: 'inset(50%)',
      height: 1,
      overflow: 'hidden',
      position: 'absolute',
      bottom: 0,
      left: 0,
      whiteSpace: 'nowrap',
      width: 1,
    });

    const handleSubmit =  (e) => {
        e.preventDefault();

        const formData = new FormData();
        //  formData.append('profile_picture', updatedUserInfo.profile_picture || "");
        formData.append('first_name', updatedUserInfo.first_name);
        formData.append('last_name', updatedUserInfo.last_name);
        formData.append('mobile', updatedUserInfo.mobile);
        formData.append('bio', updatedUserInfo.bio);
        formData.append('gender', updatedUserInfo.gender);
        
        if (updatedUserInfo.profile_picture instanceof File) {
          formData.append('profile_picture', updatedUserInfo.profile_picture);
        }

        // dispatch(updateUserInfo(axiosInstance,formData));
        console.log("da--ta  ",formData)
        try {
          dispatch(updateUserInfo({axiosInstance, formData}));
        } catch (error) {
          console.error("Error updating user info:", error);
          toast.error("An error occurred while updating your profile.");
        }
    };


  return (
    <Box >
    <form onSubmit={handleSubmit} encType="multipart/form-data">    
    <Grid container m={5} spacing={2} flex={6} width="70%" p={2}>
      <Grid  item xs ={12} >
        <Grid item xs={6}>
          <Avatar
            alt="Profile Picture"
            src={imageUrl}
            sx={{ width: 150, height: 150, margin: 4 }}
          />
        </Grid>
        <Grid item xs={6} >
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            // startIcon={<CloudUploadIcon />}
            
            >
            Upload image
            <VisuallyHiddenInput 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            />
          </Button>
        </Grid>
      </Grid>
        
      <Grid item xs={6}>
        <TextField
          required
          id="username"
          label="username"
          variant="outlined"
          fullWidth
          value={updatedUserInfo.username || ''}
          onChange={handleInputChange}
          disabled
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          required
          id="email"
          label="email"
          variant="outlined"
          fullWidth
          value={updatedUserInfo.email || ''}
          disabled
        />
      </Grid>      
      <Grid item xs={3}>
        <TextField
          required
          id="first_name"
          label="First Name"
          variant="outlined"
          fullWidth
          value={updatedUserInfo.first_name || ''}
          onChange={handleInputChange}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          required
          id="last_name"
          label="Last Name"
          variant="outlined"
          fullWidth
          value={updatedUserInfo.last_name || ''}
          onChange={handleInputChange}
        />
      </Grid>
      <Grid item xs={12} lg ={6}>
        <TextField
          
          id="mobile"
          label="Mobile"
          variant="outlined"
          fullWidth
          value={updatedUserInfo.mobile || ''}
          onChange={handleInputChange}
        />
      </Grid>
      <Grid item xs={12} >
        <TextField
          
          id="bio"
          label="Bio"
          variant="outlined"
          fullWidth
          value={updatedUserInfo.bio || ''}
          onChange={handleInputChange}
          rows={4}
          multiline
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          
          id="date_joined"
          label="Date Joined"
          variant="outlined"
          fullWidth
          value={updatedUserInfo.date_joined || ''}
          disabled 
        />
      </Grid>
      <Grid item xs={3}>
      <TextField

        id="gender"
        label="Gender"
        variant="outlined"
        fullWidth
        value={updatedUserInfo.gender || ''}
        onChange={handleInputChange}
      >
        {/* <MenuItem value="male">Male</MenuItem>
        <MenuItem value="female">Female</MenuItem> */}
      </TextField>
      </Grid>
    </Grid>
    <Button type="submit" variant="contained" color="primary" >
            Update Details
        </Button>
    </form>    
    </Box>
  )
}

export default MyAccount