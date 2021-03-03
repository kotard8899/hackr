import Layout from '../../../components/Layout'
import Link from 'next/link'
import axios from 'axios'
import renderHTML from 'react-render-html'
import { API } from '../../../config'
import { useState } from 'react'
import moment from 'moment'
import InfiniteScroll from 'react-infinite-scroller'
import withAdmin from '../../withAdmin'
import { getCookie } from '../../../helpers/auth'

const Links = ({ token, links, totalLinks, linksLimit, linkSkip }) => {
    const [allLinks, setAllLinks] = useState(links)
    const [limit, setlimit] = useState(linksLimit)
    const [skip, setskip] = useState(0)
    const [size, setSize] = useState(totalLinks)

    const confirmDelete = (e, id) => {
        e.preventDefault();
        
        let answer = window.confirm('Are you sure you want to delete?')
        if (answer) {
            handleDelete(id)
        }
    }

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${API}/link/admin/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log('LINK DELETE SUCCESS', res)
            process.browser && window.location.reload()
        } catch (err) {
            console.log('LINK DELETE ERRROR', err)
        }
    }

    const listOfLinks = () => (
        allLinks.map((l, i) => (
            <div className="row alert alert-primary p-2" key={i}>
                <div className="col-md-8" onClick={e => handleClick(l._id)}>
                    <a href={l.url} target="_blank">
                        <h5 className="pt-2">{l.title}</h5>
                        <h6 className="pt-2 text-danger" style={{ fontSize: '12px' }}>
                            {l.url}
                        </h6>
                    </a>
                </div>
                <div className="col-md-4 pt-2">
                    <span className="pull-right">
                        {moment(l.createdAt).fromNow()} by {l.postedBy.name}
                    </span>
                    <br/>
                    <span className="badge text-secondary pull-right">{l.clicks} clicks</span>
                </div>

                <div className="col-md-12">
                    <span className="badge text-dark">
                        {l.type} / {l.medium}
                    </span>
                    {l.categories.map((c, i) => (
                        <span className="badge text-success" key={i}>{c.name}</span>
                    ))}
                    <span onClick={(e) => confirmDelete(e,l._id)} className="badge text-danger pull-right">Delete</span>
                    <Link href={`/user/link/${l._id}`}>
                        <a>
                            <span className="badge text-warning pull-right">
                                Update
                            </span>
                        </a>
                    </Link>
                </div>
            </div>
        ))
    )

    const loadMore = async () => {
        let toSkip = skip + limit

        const res = await axios.post(`${API}/links/`, { skip: toSkip, limit }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        setAllLinks([...allLinks, ...res.data])
        setSize(res.data.length)
        setskip(toSkip)
    }

    return (
        <Layout>
            <div className="row">
                <div className="col-md-12">
                    <h1 className="display-4 font-weight-bold">All Links</h1>
                </div>
            </div>
            <br />
            <InfiniteScroll
                pageStart={0}
                loadMore={loadMore}
                hasMore={size > 0 && size >= limit}
                loader={
                    <div className="loader" key={0}>
                        <img src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" alt="loader"/>
                    </div>
                }
            >
                <div className="row">
                    <div className="col-md-12">
                        {listOfLinks()}
                    </div>
                </div>
            </InfiniteScroll>
        </Layout>
    )
}

Links.getInitialProps = async ({ query, req }) => {
    let skip = 0
    let limit = 2

    const token = getCookie('token', req)

    const res = await axios.post(`${API}/links/`, { skip, limit }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return {
        links: res.data,
        totalLinks: res.data.length,
        linksLimit: limit,
        linkSkip: skip,
        token
    }
}

export default withAdmin(Links)