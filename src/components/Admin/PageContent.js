import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getUserList, reset } from '../../Slice/adminSlice';
import { useState } from 'react';
import {  Edit,Delete, Save } from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';


    
    export default function PageContent() {
      const columns = [
        { id: 'id', label: 'ID', minWidth: 20 },
        { id: 'email', label: 'Email', minWidth: 120 },
        {
          id: 'username',
          label: 'Username',
          minWidth: 80,
          align: 'right',
          
        },
        {
          id: 'first_name',
          label: 'first_name',
          minWidth: 50,
          align: 'right',      
        },
        {
          id: 'last_name',
          label: 'last_name',
          minWidth: 50,
          align: 'right',
          
        },
        {
          id:'is_active',
          label:'is_active',
          minWidth:40,
          align: 'right',
          editable: true,
        },
        {
          id:'status',
          label:'status',
          minWidth:40,
          align: 'right',
          editable: true,
        },
        { 
          id: 'actions', 
          label: 'Actions', 
          minWidth: 100, 
          align: 'right',
        },
      ];


   const users = useSelector(state=> state.admin.userList)
   const dispatch = useDispatch()
  
  console.log(users)

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [editingRowId, setEditingRowId] = useState(null)
  const [editedData, setEditedData] = useState({});

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleEditUser = row => {
    setEditingRowId(row.id);
    setEditedData(row); 
  };

  const handleSaveUser = () => {
    // Handle saving logic here, for example, dispatch an action to update the data in Redux store
    console.log('Edited data:', editedData);
    // Reset the editing state
    setEditingRowId(null);
    setEditedData({});
  };

  useEffect(() => {
    if (users.length === 0){
      dispatch(getUserList())
      dispatch(reset())
    }
  },[]);


  return (
    <Paper sx={{ width: '100%' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={3}>
                Users
              </TableCell>
              <TableCell align="center" colSpan={5}>
                Details
              </TableCell>
            </TableRow>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ top: 57, minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

            <TableBody>
              {Array.isArray(users) && users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (

                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map(column => (
                      <TableCell key={column.id} align={column.align}>
                        {editingRowId === row.id && column.editable ? (
                          <input
                            type="text"
                            value={editedData[column.id] || ''}
                            onChange={e =>
                              setEditedData(prevData => ({
                                ...prevData,
                                [column.id]: e.target.value,
                              }))
                            }
                          />
                        ) : column.id === 'actions' ? (
                          editingRowId === row.id ? (
                            <Button variant="contained" color="primary" onClick={handleSaveUser}>
                              <Save />
                            </Button>
                          ) : (
                            <div>
                              <IconButton
                                aria-label="edit"
                                onClick={() => handleEditUser(row)}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                onClick={() => handleDeleteUser(row)}
                              >
                                <Delete />
                              </IconButton>
                            </div>
                          )
                        ) : column.id === 'is_active' ? (
                          row[column.id] ? 'Active' : 'Inactive'
                        ) : (
                          row[column.id]
                        )}
                      </TableCell>
                    ))}
                  </TableRow>


                  );
                })}
            </TableBody>

        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}