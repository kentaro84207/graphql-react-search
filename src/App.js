import React, { useState, useRef } from 'react'
import { ApolloProvider, Mutation, Query } from 'react-apollo'
import client from './client'
import { ADD_STAR, REMOVE_STAR, SEARCH_REPOSITORIES } from './graphql'

const StarButton = ({node, query, first, last, before, after}) => {
  const {totalCount} = node.stargazers
  const {viewerHasStarred} = node
  const starCount = totalCount === 1 ? '1 star' : `${totalCount} stars`
  const StarStatus = ({addOrRmoveStar}) => {
    return (
      <button
        onClick={
          () => {
            addOrRmoveStar({
              variables: {input: {starrableId: node.id}},
              update: (store, {data: {addStar, removeStar}}) => {
                const {starrable} = addStar || removeStar
                const data = store.readQuery({
                  query: SEARCH_REPOSITORIES,
                  variables: { query, first, last, before, after }
                })
                const {edges} = data.search
                const newEdges = edges.map(edge => {
                  if (edge.node.id === node.id) {
                    const {totalCount} = edge.node.stargazers
                    // const diff = viewerHasStarred ? -1 : 1
                    const diff = starrable.viewerHasStarred ? 1 : -1
                    const newTotalCount = totalCount + diff
                    edge.node.stargazers.totalCount = newTotalCount
                  }
                  return edge
                })
                data.search.edges = newEdges
                store.writeQuery({
                  query: SEARCH_REPOSITORIES,
                  data
                })
              }
            })
          }
        }>
        {starCount} | {viewerHasStarred ? 'stared' : '-'}
      </button>
    )
  }

  return (
    <Mutation
      mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}
      // graphQLからfetchするパターン
      // refetchQueries={
      //   [
      //     {
      //       query: SEARCH_REPOSITORIES,
      //       variables: { query, first, last, before, after }
      //     }
      //   ]
      // }
    >
      {
        addOrRmoveStar => <StarStatus addOrRmoveStar={addOrRmoveStar} /> 
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
  query: ""
}

const App = () => {
  const [state, setState] = useState(DEFAULT_STATE)
  const { query, first, last, before, after } = state
  const myRef = useRef(null)

  const handleSubmit = e => {
    e.preventDefault()
    setState({
      ...DEFAULT_STATE,
      query: myRef.current.value
    })
  }

  return (
    <ApolloProvider client={client}>
      <form onSubmit={handleSubmit}>
        <input ref={myRef} type="text" />
        <input type="submit" value="Submit" />
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
                          <StarButton node={node} {...{query, first, last, before, after}}/>
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
