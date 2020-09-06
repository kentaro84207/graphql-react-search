import React, { useState, useCallback } from 'react'
import { ApolloProvider, Mutation, Query } from 'react-apollo'
import client from './client'
import { ADD_STAR, SEARCH_REPOSITORIES } from './graphql'

const StarButton = ({node}) => {
  const {totalCount} = node.stargazers
  const {viewerHasStarred} = node
  const starCount = totalCount === 1 ? '1 star' : `${totalCount} stars`
  const StarStatus = ({addStar}) => {
    return (
      <button
        onClick={
          () => {
            addStar({
              variables: {input: {starrableId: node.id}}
            })
          }
        }>
        {starCount} | {viewerHasStarred ? 'stared' : '-'}
      </button>
    )
  }

  return (
    <Mutation mutation={ADD_STAR}>
      {
        addStar => <StarStatus addStar={addStar} /> 
      }
    </Mutation>
  )
}

const PER_PAGE = 5
const DEFAULT_STATE = {
  after: null,
  before: null,
  first: PER_PAGE,
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
                          &nbsp;
                          <StarButton node={node}/>
                        </li>
                      )
                    })
                  }
                </ul>

                {
                  search.pageInfo.hasPreviousPage ?
                  <button
                    onClick={()=> {
                      setState({
                        ...state,
                        first: null,
                        after: null,
                        last: PER_PAGE,
                        before: search.pageInfo.startCursor
                      })
                    }}
                  >
                    Previous
                  </button>
                  :
                  null
                }

                {
                  search.pageInfo.hasNextPage ?
                  <button
                    onClick={()=> {
                      setState({
                        ...state,
                        first: PER_PAGE,
                        after: search.pageInfo.endCursor,
                        last: null,
                        before: null
                      })
                    }}
                  >
                    Next
                  </button>
                  :
                  null
                }
              </>
            )
          }
        }
      </Query>
    </ApolloProvider>
  )
}

export default App
