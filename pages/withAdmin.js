import axios from 'axios'
import { API } from '../config'
import { getCookie } from '../helpers/auth'

const withAdmin = Page => {

  const WithAdminUser = props => <Page {...props} /> 

  WithAdminUser.getInitialProps = async context => {
    const token = getCookie('token', context.req)

    let user = null
    let userLinks = []

    if (token) {
      try {
        const res = await axios.get(`${API}/admin`, {
          headers: {
            authorization: `Bearer ${token}`,
            contentType: 'application/json'
          }
        })
        user = res.data.user
        userLinks = res.data.links
      } catch (err) {
        if (err.response.status === 401) {
          user = null
        }
      }
    }

    if (user === null) {
      // redirect
      context.res.writeHead(302, {
        Location: '/'
      })
      context.res.end()
    } else {
      return {
        ...(Page.getInitialProps ? await Page.getInitialProps(context) : {}),
        user,
        token,
        userLinks
      }
    }
  }

  // export async function getStaticProps() {
  //   const res = await axios.get('https://jsonplaceholder.typicode.com/todos')
  //   return {
  //     props: {
  //       todos: res.data,
  //     },
  //   }
  // }

  return WithAdminUser
}

export default withAdmin