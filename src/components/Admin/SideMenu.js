import React from 'react';
import { AccountBox, Article, Block, Group, Home, ModeNight, Newspaper, Person, ReportRounded, Settings, Storefront, Verified, VerifiedOutlined } from '@mui/icons-material';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Switch } from '@mui/material';
import { GiFamilyTree, GiTreeBranch } from 'react-icons/gi';
import { useDispatch } from 'react-redux';
import { getUserList } from '../../Slice/adminSlice';


function SideMenu() {
  const dispatch = useDispatch()
  const handleUserList =() =>{
    dispatch(getUserList())
  }


  return (
    <Box flex={1} p={2} sx={{ display: { xs: "none", sm: "block" } }}>
    <Box position="fixed">
      <List>
        <ListItem disablePadding>
          <ListItemButton component="a" href="#home">
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href="#simple-list" onClick={handleUserList}>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText  primary="Users" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href="#simple-list">
            <ListItemIcon>
              <VerifiedOutlined />
            </ListItemIcon>
            <ListItemText primary="Verified" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href="#simple-list">
            <ListItemIcon>
              <ReportRounded />
            </ListItemIcon>
            <ListItemText primary="Reported" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href="#simple-list">
            <ListItemIcon>
              <Newspaper />
            </ListItemIcon>
            <ListItemText primary="Posts" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href="#simple-list">
            <ListItemIcon>
              <Block />
            </ListItemIcon>
            <ListItemText primary="Blocked" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href="#simple-list">
            <ListItemIcon>
              <GiFamilyTree size="25px"/>
            </ListItemIcon>
            <ListItemText primary="Family Tree" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href="#simple-list">
            <ListItemIcon>
              <ModeNight />
            </ListItemIcon>
            <Switch onChange={e=>setMode(mode === "light" ? "dark" : "light")}/>
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  </Box>
  )
}

export default SideMenu