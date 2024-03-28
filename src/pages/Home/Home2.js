
import { Box, Stack, createTheme, ThemeProvider } from '@mui/material'
import  { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Feed from '../../components/Feed'
import AddPost from '../../components/AddPost'
import Rightbar from '../../components/Rightbar'
import { Route, Routes, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { reset } from '../../Slice/authSlice'
import MyAccount from '../../components/MyAccount'
import Navbar from '../../components/Navbar/Navbar'
import { toast } from 'react-toastify'


function Home2() {
    const [mode,setMode] = useState("light")
    const navigate = useNavigate()
    const dispatch = useDispatch()
    // const [selectedMenuItem, setSelectedMenuItem] = useState("Home");
    
    const { user, isError, message } = useSelector((state) => state.auth)
    useEffect(() => {
      if (isError) {
        toast.error(message)
        console.log(message)
      }
  
      if (!user) {
        navigate('/login')
      }
  
      return () => {
        dispatch(reset())
      }
    }, [user, isError, message])

    const darkTheme = createTheme({
        palette: {
            mode: mode,
        },
    });
    
  return (
    
    <ThemeProvider theme={darkTheme}>
      
        <Box bgcolor={"background.default"} color={"text.primary"}>
           {/* <Navbar/>
           <Stack direction="row" spacing={2} marginTop="150px" justifyContent="space-between">
             <Sidebar setMode={setMode} mode={mode} selectedMenuItem={selectedMenuItem} setSelectedMenuItem={setSelectedMenuItem}/>
                <Routes>

                  <Route path="/profile" element={<MyAccount />} />
                </Routes>
                { selectedMenuItem ==="Home" && <Feed />}
                { selectedMenuItem === "Home" && <Rightbar />}
                { selectedMenuItem === "Profile" && <MyAccount/>}
           </Stack> */}
           {/* <AddPost /> */}
           <Navbar />
        </Box>
    </ThemeProvider>
  )
}

export default Home2