import React, { useEffect } from 'react';
import {  Typography, Avatar,Button, Stack, Box, Grid, Tabs, Tab, CssBaseline, ImageList, ImageListItem } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { getBio, resetPost } from '../../Slice/postSlice';
import useAxios from '../../Slice/useAxios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';

function ProfileDetails() {
  const [selectedTab, setSelectedTab] = useState(0);

  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { userBio, userPost } = useSelector((state) =>state.post)
  const navigate = useNavigate()

  const axiosInstance = useAxios(user?.access);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
//   useEffect(() => {
//     if (isError) {
//       toast.error(message)
//       dispatch(resetPost())
//     }    
//       dispatch(getBio(axiosInstance));
//       dispatch(resetPost())
//   }, []) 

    useEffect(() => {
        dispatch(getBio(axiosInstance));

        return () => {
        dispatch(resetPost()); 
        };
    }, []);
  return (
    <Stack>
        <CssBaseline />
        <Stack direction="row" spacing={4} marginTop={22}>
            <Box>
                <Avatar src={`http://127.0.0.1:8000/media/${userBio?.profilePicture}`} sx={{ width: 150, height: 150, marginBottom: 2 }} />
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 'large' }}>{userBio?.firstName} {userBio?.lastName}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 'smaller' }}>@{userBio?.username}</Typography>
            </Box>
            <Box width="500px">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1">0 Post</Typography>
                    <Typography variant="body1">0 Followers</Typography>
                    <Typography variant="body1">0 Following</Typography>
                    <Button variant="outlined" size="small" onClick={(e) => navigate('/profile/account-settings')}>Edit Profile</Button>
                </Box>
                <Box>
                <Typography sx={{ fontWeight: 'bold', fontSize: 'smaller' }}>Bio</Typography>
                <Typography variant="body1">{userBio?.bio}</Typography>
                </Box>
            </Box>
            </Stack>
            <Grid item xs={12}>
        {/* Tabs for different sections */}
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          <Tab label="Posts" />
          {/* <Tab label="IGTV" />
          <Tab label="Tagged" /> */}
        </Tabs>
      </Grid>
      <Grid item xs={12}>
        {/* Content section based on selected tab */}
        {selectedTab === 0 && (
          <Grid container spacing={2}>
            {/* Display user's posts */}
            {/* Example: <PostCard /> components */}
          </Grid>
        )}
        {selectedTab === 1 && (
          <Grid container spacing={2}>
            {/* Display user's IGTV videos */}
            {/* Example: <IGTVVideo /> components */}
          </Grid>
        )}
        {selectedTab === 2 && (
          <Grid container spacing={2}>
            {/* Display tagged photos */}
            {/* Example: <TaggedPhoto /> components */}
          </Grid>
        )}
      </Grid>
      <Grid item xs={12}>
        {/* Followers/Following counts section */}
        <ImageList sx={{ width: 750, height: 450 }} cols={5} rowHeight={164}>
            {itemData.map((item) => (
                <ImageListItem key={item.img}>
                <img
                    srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    src={`${item.img}?w=164&h=164&fit=crop&auto=format`}
                    alt={item.title}
                    loading="lazy"
                />
                </ImageListItem>
            ))}
        </ImageList>
      </Grid>
    </Stack>
  );
}

export default ProfileDetails;

const itemData = [
    {
      img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
      title: 'Breakfast',
    },
    {
      img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
      title: 'Burger',
    },
    {
      img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
      title: 'Camera',
    },
    {
      img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
      title: 'Coffee',
    },
    {
      img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
      title: 'Hats',
    },
    {
      img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
      title: 'Honey',
    },
    {
      img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
      title: 'Basketball',
    },
    {
      img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
      title: 'Fern',
    },
    {
      img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
      title: 'Mushrooms',
    },
    {
      img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
      title: 'Tomato basil',
    },
    {
      img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
      title: 'Sea star',
    },
    {
      img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
      title: 'Bike',
    },
  ];