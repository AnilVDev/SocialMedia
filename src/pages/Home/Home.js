import React from 'react'
import { styled, useTheme } from '@mui/material/styles';
import Navbar from '../../components/Navbar/Navbar'
import Feed from '../../components/Feed'
import Rightbar from '../../components/Rightbar'
import { Box, CssBaseline } from '@mui/material'

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

function Home() {
  

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

        <Navbar/>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }} display="flex">
          <DrawerHeader />
          <Feed/>
          <Rightbar/>
        </Box>
        
    </Box>
  )
}

export default Home