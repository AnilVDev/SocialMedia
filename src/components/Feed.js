import { Box, Skeleton, Stack } from '@mui/material';
import React, { useState } from 'react'
import Post from './Post';

const Feed = () => {
    const [loading, setLoading] = useState(true);
   
    setTimeout(() => {
      setLoading(false);
    }, [200]);

  return (
    <Box flex={4} marginTop={6} p={{ xs: 0, md: 2 }} width="65%">
      {loading ? (
        <Stack spacing={1}>
          <Skeleton variant="text" height={100} />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="rectangular" height={300} />
        </Stack>
      ) : (
        <>
          <Post />
          {/* <Post />
          <Post />
          <Post />
          <Post />
          <Post /> */}
        </>
      )}
    </Box>
  )
}

export default Feed