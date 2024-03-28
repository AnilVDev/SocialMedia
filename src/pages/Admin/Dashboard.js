import React from 'react';
import './Dashboard.css';
import { Space } from 'antd';
import SideMenu from '../../components/Admin/SideMenu';
import PageContent from '../../components/Admin/PageContent';
import DashHeader from '../../components/Admin/DashHeader';

import { Grid, Stack, styled, Paper } from '@mui/material';
import MenuNavbar from '../../components/Admin/MenuNavbar';


function Dashboard() {
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  })); 
  
  return (
    <div className='Dashboard'>
      {/* <DashHeader/>
      <Grid container spacing={2}>
        <Grid item xs={2} md={2}>
          <SideMenu/>
        </Grid>
        <Grid item xs={10} md={10} sm={12}>
        <PageContent/>
        </Grid>
      </Grid>       */}
      <MenuNavbar/>
    </div>
  )
}

export default Dashboard