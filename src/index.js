import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./index.css"
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, ApolloLink, concat } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useSelector } from 'react-redux';
// import { createUploadLink } from 'apollo-upload-client';
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";



const httpLink = new HttpLink({
  uri: 'http://127.0.0.1:8000/graphql/',
});
const authMiddleware = new ApolloLink((operation, forward) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const accessToken = user ? user.access : null; 
  if (accessToken){

    operation.setContext({
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
  return forward(operation);
});


const uploadLink = createUploadLink({
  uri: 'http://127.0.0.1:8000/graphql/',
});

const link = concat(authMiddleware, uploadLink);
const cache = new InMemoryCache();

const client = new ApolloClient({
  cache,
  link,
});


// const client = new ApolloClient({
//   cache: new InMemoryCache(),
//   link: concat(authMiddleware,httpLink),
// });




// const client = new ApolloClient({
//   uri: 'http://127.0.0.1:8000/graphql/',
//   cache: new InMemoryCache(),
// });


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
       <App />
    </ApolloProvider>
  </React.StrictMode>
);


