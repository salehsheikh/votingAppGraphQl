
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
const client = new ApolloClient({
  uri: 'http://localhost:5000/graphql',
  cache: new InMemoryCache(),
});

createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
)
