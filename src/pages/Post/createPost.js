import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Switch,
  Box,
  Typography,
  styled,
  useTheme,
  useMediaQuery,
  Input,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import useAxios from '../../Slice/useAxios';
import { createPost } from '../../Slice/postSlice';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { gql, useMutation } from '@apollo/client';

const InputWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  marginBottom: theme.spacing(2),
}));

const PreviewContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  marginBottom: theme.spacing(2),
  width: '100%',
  maxWidth: '400px',
  overflow: 'auto',
}));

const PreviewItem = styled('div')(({ theme }) => ({
  width: '100px',
  height: '100px',
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
  position: 'relative',
  overflow: 'hidden',
}));

const PreviewImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});


  const CREATE_POST = gql`
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        post {
          id
          description
          privacySettings
          dateOfMemory
        }
      }
    }`

export default function CreatePost() {

  const { user } = useSelector((state) => state.auth)

  const [open, setOpen] = useState(true);
  const [date, setDate] = useState(null);
  const [description,setDescription] = useState("")
  const [previews, setPreviews] = useState([]);
  const [switchValue, setSwitchValue] = useState(false);
  const [files, setFiles] = useState([]);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate()
  // const dispatch = useDispatch()

  const [createPostMutation,{error,loading,data}] = useMutation(CREATE_POST);

  // const axiosInstance = useAxios(user?.access);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    navigate(-1)
  };

  const handleInputChange = (e) => {
    const newFiles = e.target.files;
    setFiles(newFiles);
    
    const newPreviews = Array.from(newFiles).map((file) =>
      URL.createObjectURL(file)
    );
    setPreviews(newPreviews);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   handleClose()

  //   const formData = new FormData();

  //   formData.append('privacy_settings', switchValue);
  //   formData.append('description', description);
  //   formData.append('date_of_memory', date);
  //   const filesArray = Array.from(files);
  //   filesArray.forEach(file => {
  //     formData.append('media', file);
  //   });
  //   dispatch(createPost({axiosInstance,formData}))

  //   setOpen(false);
  //   setDate(null);
  //   setDescription("");
  //   setPreviews([]);
  //   setSwitchValue(false);
  //   setFiles([]);
  // }

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleClose();
  
    const formData = new FormData();
    formData.append('privacySettings', switchValue);
    formData.append('description', description);
    formData.append('dateOfMemory', date);
    files.forEach(file => {
      formData.append('media', file);
    });
  
    try {
      const response = await createPostMutation({
        variables: {
          input: {
            description,
            privacySettings: switchValue,
            dateOfMemory: date,
            media: files,
          },
        },
      });
      console.log("response ** * * ",response.data);
      setOpen(false);
      setDate(null);
      setDescription('');
      setPreviews([]);
      setSwitchValue(false);
      setFiles([]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };



  return (
    <React.Fragment>
        <form onSubmit={handleSubmit} encType="multipart/form-data">  
        {/* <Button variant="outlined" onClick={handleClickOpen}>
            Open responsive dialog
        </Button> */}
        <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
            fullWidth
        >
            <DialogTitle id="responsive-dialog-title">
            {"Post"}
            </DialogTitle>
            <DialogContent>
            <DialogContentText>
                <InputWrapper>
                <Typography variant="body1">
                    Who can see?
                </Typography>
                <Box
                    display="flex"
                    justifyContent="flex-start"
                    marginLeft={2}
                >
                    <Switch
                    checked={switchValue}
                    onChange={() => setSwitchValue(!switchValue)}
                    />
                </Box>
                <Typography variant="body1">
                    {switchValue ? 'Friends' : 'Everyone'}
                </Typography>
                </InputWrapper>
                <PreviewContainer>
                {previews.map((preview, index) => (
                    <PreviewItem key={index}>
                    <PreviewImage src={preview} alt={`Preview ${index}`} />
                    </PreviewItem>
                ))}
                {/* <PreviewImage src={previews} alt=''/> */}
                </PreviewContainer>
                <input
                  accept="image/*, video/*"
                  style={{ display: 'none' }}
                  id="file-input"
                  multiple
                  type="file"
                  onChange={handleInputChange}
                />
                <label htmlFor="file-input">
                <Button variant="contained" component="span">
                    Upload
                </Button>
                </label>
                <TextField
                id="description"
                label="description.."
                variant="outlined"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                multiline
                sx={{
                    mt: 1,
                }}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Memory date"
                    value={date}
                    onChange={(newValue) => {
                      if (newValue !== null) {
                        const formattedDate = dayjs(newValue).format("YYYY/MM/DD");
                        setDate(formattedDate);
                      }
                    }}
                    views={['year', 'month', 'day']}
                    inputFormat="YYYY/MM/DD"
                    slotProps={{
                    textField: {
                        size: 'small',
                    },
                    }}
                    sx={{
                    mt: 1,
                    }}
                />
                </LocalizationProvider>
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose} autoFocus>
                cancel
            </Button>
            <Button autoFocus onClick={handleSubmit}>
                Create
            </Button>
            </DialogActions>
        </Dialog>
        </form>
    </React.Fragment>
  );
}