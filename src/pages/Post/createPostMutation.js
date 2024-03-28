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
import dayjs from 'dayjs';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';



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


  // const CREATE_POST = gql`
  //   mutation CreatePost($input: CreatePostInput!) {
  //     createPost(input: $input) {
  //       post {
  //         id
  //         description
  //         privacySettings
  //         dateOfMemory
  //       }
  //     }
  //   }`

  const CREATE_POST_MUTATION = gql`
  mutation CreatePost($description: String, $image: Upload!, $privacySettings: Boolean, $dateOfMemory: Date) {
    createPost( description: $description, image: $image, privacySettings: $privacySettings, dateOfMemory: $dateOfMemory) {
      post {
        description
        privacySettings
        dateOfMemory
      }
    }
  }
`;

export default function CreatePostMutation() {


  const [open, setOpen] = useState(true);
  const [date, setDate] = useState(null);
  const [description,setDescription] = useState("")
  const [previews, setPreviews] = useState();
  const [switchValue, setSwitchValue] = useState(false);
  const [files, setFiles] = useState();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate()


  // const [createPostMutation,{error,loading,data}] = useMutation(CREATE_POST);

  const [createPostMutation, { loading, error, data }] = useMutation(CREATE_POST_MUTATION);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    navigate(-1)
  };

  const handleInputChange = (e) => {
    const newFiles = e.target.files[0];
    const imageUrl = URL.createObjectURL(newFiles);
    setFiles(newFiles);  
    setPreviews(imageUrl);

    
  };



  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   handleClose();

  //   try {
  //     console.log(description,switchValue,date,files)
  //     const response = await createPostMutation({
  //       variables: {
  //         input: {
  //           description,
  //           privacySettings: switchValue,
  //           dateOfMemory: date,
  //           media: files,
  //         },
  //       },
  //     });
  //     if (error) return `Submission error! ${error.message}`;
  //     console.log("response ** * * ",response.data);
  //     setOpen(false);
  //     setDate(null);
  //     setDescription('');
  //     setPreviews([]);
  //     setSwitchValue(false);
  //     setFiles([]);
  //   } catch (error) {
  //     console.error('Error creating post -- :', error);
  //   }
  // };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log(files)
    try {
      if (!files) {
        toast.error('Please select an image to upload');
        return;
      }
      
      handleClose();
      
      const response = await createPostMutation({
        variables: {
          description,
          image: files,
          privacySettings: switchValue,
          dateOfMemory: date,
          
        },
      });
      
      console.log("r e s ///",response.data);
      
      setOpen(false);
      setDate(null);
      setDescription('');
      setPreviews();
      setSwitchValue(false);
      setFiles();
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
                    <PreviewItem >
                    <PreviewImage src={previews}  />
                    </PreviewItem>             
                {/* <PreviewImage src={previews} alt=''/> */}
                </PreviewContainer>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="file-input"
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