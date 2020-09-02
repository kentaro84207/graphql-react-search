import React, { useState, useCallback } from 'react'
import { ApolloProvider } from 'react-apollo'
import { Query } from 'react-apollo'
import client from './client'
import { SEARCH_REPOSITORIES } from './graphql'

const DEFAULT_STATE = {
  after: null,
  before: null,
  first: 5,
  last: null,
  query: "フロントエンドエンジニア"
}

const App = () => {
  const [state, setState] = useState(DEFAULT_STATE)
  const { query, first, last, before, after } = state

  const handleChange = useCallback((e) => {
    setState({
      ...DEFAULT_STATE,
      query: e.target.value
    })
  },[])

  return (
    <ApolloProvider client={client}>
      <form>
        <input value={query} onChange={handleChange} />
      </form>
      <Query
        query={SEARCH_REPOSITORIES}
        variables={{ query, first, last, before, after }}
      >
        {
          ({loading, error, data}) => {
            if (loading) return 'Loading...'
            if (error) return `Error! ${error.message}`

            const {search} = data
            const {repositoryCount} = search
            const repositoryUnit = repositoryCount === 1 ? 'Repositry' : 'Repositories'
            const title = `GitHub Repositories Search Results - ${repositoryCount} ${repositoryUnit}`
            return (
              <>
                <h2>{title}</h2>
                <ul>
                  {
                    search.edges.map(edge => {
                      const {node} = edge
                      return(
                        <li key={node.id}>
                          <a href={node.url} target="_blank" rel="noopener noreferrer">{node.name}</a>
                        </li>
                      )
                    })
                  }
                </ul>
              </>
            )
          }
        }
      </Query>
    </ApolloProvider>
  )
}

export default App
