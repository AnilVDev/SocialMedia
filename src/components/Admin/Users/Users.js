import { Avatar, Box } from '@mui/material'
import { DataGrid, gridClasses } from '@mui/x-data-grid'
import { Typography } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { getUserList } from '../../../Slice/adminSlice'
import { useDispatch } from 'react-redux'
import { grey } from '@mui/material/colors'
import UsersActions from './UsersActions'





function Users() {
    const users = useSelector(state=> state.admin.userList)
    const dispatch = useDispatch()

    const [pageSize, setPageSize] = useState(5);
    const [rowId, setRowId] = useState(null);


    useEffect(() =>{
        if (users.length === 0){
            dispatch(getUserList())
            dispatch(reset())
          }
    })

    const columns = useMemo(
        () => [
          { field: 'id', headerName: 'Id', width: 50 },
          {
            field: 'profile_picture',
            headerName: 'Avatar',
            width: 100,
            renderCell: (params) => <Avatar src={params.row.profile_picture} />,
            sortable: false,
            filterable: false,
          },
          { field: 'first_name', headerName: 'Firstname', width: 200 },
          { field: 'last_name', headerName: 'Lastname', width: 200 },
          { field: 'email', headerName: 'Email', width: 200 },
          {
            field: 'is_active',
            headerName: 'Active',
            width: 100,
            type: 'boolean',
            editable: true,
          },
          {
            field: 'status',
            headerName: 'Status',
            width: 100,
            type: 'singleSelect',
            valueOptions: ['active', 'suspended', 'deleted'],
            editable: true,
          },
          {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            renderCell: (params) => (
              <UsersActions {...{ params, rowId, setRowId }} />
            ),
          },
        ],
        [rowId]
      );

    return (
    <Box 
    sx={{
        height: 500,
        width: '100%',
      }}
    >
        <Typography
                variant="h3"
                component="h3"
                sx={{ textAlign: 'center', mt: 3, mb: 3 }}
        >
            Manage Users
        </Typography>
        <DataGrid
            columns={columns}
            rows={users}
            getRowId={row=>row.id}
            pageSizeOptions={[5, 10, 25]}          
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            getRowSpacing={(params) => ({
                top: params.isFirstVisible ? 0 : 5,
                bottom: params.isLastVisible ? 0 : 5,
              })}
              sx={{
                [`& .${gridClasses.row}`]: {
                  bgcolor:grey[200],
                },
            }}  
            onCellEditStart={(params) => setRowId(params.id)}
        />
    </Box>
  )
}

export default Users