import React from 'react'
import { Route, Routes } from 'react-router'
import Home from '../pages/Home/Home'
import Profile from '../pages/Profile/Profile'
import Dashboard from '../pages/Admin/Dashboard'
import NotFoundPage from '../pages/PageNotFound'
import ProfileSettings from '../pages/Profile/ProfileSettings'
// import CreatePost from '../pages/Post/createPost'
import CreatePostMutation from '../pages/Post/createPostMutation'

export default function MainRouter() {
  return (
    <>
        <Routes>
            <Route path='/' element={ <Home />} />
            <Route path='/profile' element= { <Profile />} />
            <Route path='/profile/account-settings' element= { <ProfileSettings />} />
            <Route path = "/dashboard" element={ <Dashboard /> } />
            <Route path='/create-post' element ={ <CreatePostMutation/> } />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>  
    </>
  )
}
