import Head from 'next/head'
import Link from 'next/link'
import Router from 'next/router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { isAuth, logout } from '../helpers/auth'

Router.onRouteChangeStart = url => NProgress.start()
Router.onRouteChangeComplete = url => NProgress.done()
Router.onRouteChangeError = url => NProgress.done()

const Layout = ({ children }) => {
    const head = () => (
        <Head>
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"
                integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l"
                crossOrigin="anonymous"
            />
            <link rel="stylesheet" href="static/css/styles.css" />
        </Head>
    );

    const nav = () => (
        <ul className="nav nav-tabs bg-warning">
            <li className="nav-item">
                <Link href="/">
                    <a className="nav-link text-dark">
                        Home
                    </a>
                </Link>
            </li>

            <li className="nav-item">
                <Link href="/user/link/create">
                    <a className="nav-link text-dark btn btn-success" style={{borderRadius: '0'}}>
                        Submit a link
                    </a>
                </Link>
            </li>

            {process.browser && !isAuth() && (
                <>
                    <li className="nav-item">
                        <Link href="/login">
                            <a className="nav-link text-dark">
                                Login
                            </a>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link href="/register">
                            <a className="nav-link text-dark">
                                Register
                            </a>
                        </Link>
                    </li>
                </>
            )}

            {process.browser && isAuth() && isAuth().role === 'admin' && (
                <li className="nav-item ml-auto">
                    <Link href="/admin">
                        <a className="nav-link text-dark">
                            {isAuth().name}
                        </a>
                    </Link>
                </li>
            )}

            {process.browser && isAuth() && isAuth().role === 'subscriber' && (
                <li className="nav-item ml-auto">
                    <Link href="/user">
                        <a className="nav-link text-dark">
                            {isAuth().name}
                        </a>
                    </Link>
                </li>
            )}

            {isAuth() && (
                <li className="nav-item">
                    <a onClick={logout} className="nav-link text-dark">
                        Logout
                    </a>
                </li>
            )}
        </ul>
    );
    return (
        <>
            {head()} {nav()} <div className="container pt-5 pb-5">{children}</div>
        </>
    );
};

export default Layout;
