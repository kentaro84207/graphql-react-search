import gql from 'graphql-tag'

export const ME = gql`
    query me {
      user(login: "kentaro84207") {
        name
        avatarUrl
      }
    }
  `
