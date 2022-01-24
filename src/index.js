import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  useQuery,
  useSubscription,
  gql
} from '@apollo/client';

import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';


const httpLink = new HttpLink({
  uri: 'https://p5.pra.st/graphql/',
  headers: {
    Authorization: "JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNjQxNDU4NjAxLCJvcmlnSWF0IjoxNjQxNDU4MzAxfQ.H0gyDrUj-VNYwQa_8AloWaUi5h0daV23AT-O7zpDFuE"
  }
});

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:8000/graphql/',
  options: {
    reconnect: true,
    connectionParams: {
      Authorization: "JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNjQxNDU4NjAxLCJvcmlnSWF0IjoxNjQxNDU4MzAxfQ.H0gyDrUj-VNYwQa_8AloWaUi5h0daV23AT-O7zpDFuE"
    }
  }
});

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  headers: {
    authorization: "JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNjQxNDU4NjAxLCJvcmlnSWF0IjoxNjQxNDU4MzAxfQ.H0gyDrUj-VNYwQa_8AloWaUi5h0daV23AT-O7zpDFuE",
  }
});

const VERSION_QUERY = gql`
  query version {
    globalVersion
  }
`;

const USER_ME = gql`
  query userMe {
    userMe {
      firstName
      lastName
      emailAddress
    }
  }
`;

const USER_SUBSCRIPTION = gql`
  subscription userCreated {
    userMe {
      emailAddress
      firstName
      lastName
    }
  }
`;


function GetVersion() {
  const { loading, data, error } = useQuery(VERSION_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.globalVersion;
}


function GetOwnUser() {
  const { loading, data, error } = useQuery(USER_ME);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  console.log("Query:")
  console.log(data);
  return data.userMe.firstName;
}


function UserUpdate({ uID }) {
  const { data, loading } = useSubscription(
    USER_SUBSCRIPTION,
    { variables: { uID } }
  );
  console.log(data);
  return <h4>New user: {!loading && data.userMe.firstName}</h4>;
}

function App() {
  return (
    <div>
      <h2>My first Apollo app 🚀</h2>
      <GetVersion />
      <GetOwnUser />
      <UserUpdate />
    </div>
  );
}


ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
