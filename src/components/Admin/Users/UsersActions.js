import { Check, Save } from '@mui/icons-material';
import { Box, CircularProgress, Fab, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { green } from '@mui/material/colors';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { reset, updateStatus } from '../../../Slice/adminSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

function UsersActions({ params, rowId, setRowId }) {

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const {isError,isLoading,isSuccess,message}=useSelector(state=>state.admin)

  const dispatch = useDispatch()

  const handleOpenConfirmation = () => {
    setConfirmationOpen(true);
  };

  const handleCloseConfirmation = () => {
    setConfirmationOpen(false);
  };

  const handleSubmit = (e) =>{
    e.preventDefault();
    setLoading(true);

    const { id, is_active, status } = params.row;
    console.log( {id, is_active, status} )

    const requestData = {
      id:id,
      is_active:is_active,
      status:status,
    }
    dispatch(updateStatus(requestData))
    if (isSuccess) {
      setSuccess(true);
      setRowId(null);
    }
    setLoading(false);
  }

  // const handleConfirmSave = async(id,is_active,status) => {

  //   const requestData = {
  //     id:id,
  //     is_active:is_active,
  //     status:status,
  //   }
  //   try {
  //     const result = await dispatch(updateStatus(requestData)); 

  //     setLoading(true); 

  //     setTimeout(() => {
  //       setLoading(false); 
  //       setSuccess(true); 
  //       setConfirmationOpen(false); 
  //     }, 1000);
  //   } catch (error) {
  //     console.error('Error:', error);
  //     setLoading(false);
  //   }
  // };


  useEffect(() => {
    if (rowId === params.id && success) setSuccess(false);
    if (isError) {
      toast.error(message)      
    }
    if (isSuccess) toast.success(message)
    dispatch(reset)
  }, [rowId,isError,message,isSuccess]);

  return (
    <Box
      sx={{
        m: 1,
        position: 'relative',
      }}
      >
        {success ?(
          <Fab
          color="primary"
          sx={{
            width: 40,
            height: 40,
            bgcolor: green[500],
            '&:hover': { bgcolor: green[700] },
          }}
          >
            <Check />
          </Fab>
        ): (
          <Fab
          color="primary"
          sx={{
            width: 40,
            height: 40,
          }}
          disabled={params.id !== rowId || loading}
          onClick={handleSubmit}
          >
            <Save />
          </Fab>
        )}
        {loading && (
          <CircularProgress
            size={52}
            sx={{
              color: green[500],
              position: 'absolute',
              top: -6,
              left: -6,
              zIndex: 1,
            }}
          />
        )}

      {/* Confirmation Dialog */}
      {/* <Dialog
        open={confirmationOpen}
        onClose={handleCloseConfirmation}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <DialogTitle id="confirmation-dialog-title">Confirm Save</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description">
            Are you sure you want to save?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Fab onClick={handleCloseConfirmation}>Cancel</Fab>
            <Fab color="primary" onClick={handleConfirmSave}>
              Save
            </Fab>
          </Box>
        </DialogActions>
      </Dialog> */}

    </Box>
  )
}

export default UsersActions