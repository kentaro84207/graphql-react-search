import React, { useState } from 'react'
import { ApolloProvider } from 'react-apollo'
import { Query } from 'react-apollo'
import client from './client'
import { SEARCH_REPOSITORIES } from './graphql'

const VARIABLES = {
  after: null,
  before: null,
  first: 5,
  last: null,
  query: "フロントエンドエンジニア"
}

function App() {
  const [state, setState] = useState(VARIABLES)
  const { query, first, last, before, after } = state
  return (
    <ApolloProvider client={client}>
      <div>hi</div>
      <Query
        query={SEARCH_REPOSITORIES}
        variables={{ query, first, last, before, after }}
      >
        {
          ({loading, error, data}) => {
            if (loading) return 'Loading...'
            if (error) return `Error! ${error.message}`

            console.log(data)
            return <div></div>
          }
        }
      </Query>
    </ApolloProvider>
  )
}

export default App
