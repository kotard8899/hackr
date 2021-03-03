import cookie from 'js-cookie'
import Router from 'next/router'

// set in cookie
export const setCookie = (key, val) => {
  if (process.browser) { // if window.
    cookie.set(key, val, {
      expires: 1 // one day
    })
  }
}

// remove from cookie
export const removeCookie = (key) => {
  if (process.browser) { // if window.
    cookie.remove(key)
  }
}

// get from cookie such as stored token
// will be useful when we need to make request to server with auth token
export const getCookie = (key, req) => {
  return process.browser ? getCookieFromBrowser(key) : getCookieFromServer(key, req)
}

export const getCookieFromBrowser = (key) => {
  return cookie.get(key)
}

export const getCookieFromServer = (key, req) => {
  if (!req.headers.cookie) {
    return undefined
  }
  let token = req.headers.cookie.split(';').find(c => c.trim().startsWith(`${key}=`))
  if (!token) {
    return undefined
  }
  let tokenValue = token.split('=')[1]
  return tokenValue
}

// set in localstorage
export const setLocalStorage = (key, val) => {
  if (process.browser) {
    localStorage.setItem(key, JSON.stringify(val))
  }
}

// remove from localstorage
export const removeLocalStorage = (key) => {
  if (process.browser) {
    localStorage.removeItem(key)
  }
}

// authenticate user by passing data to cookie and localstorage during signin
export const authenticate = (res, next) => {
  setCookie('token', res.data.token)
  setLocalStorage('user', res.data.user)
  next()
}

// access user info from localstorage
export const isAuth = () => {
  if (process.browser) {
    const cookieChecked = getCookie('token')
    if (cookieChecked) {
      if (localStorage.getItem('user')) {
        return JSON.parse(localStorage.getItem('user'))
      } else {
        return false
      }
    }
  }
}

export const logout = () => {
  removeCookie('token')
  removeLocalStorage('user')
  Router.push('/login')
}

export const updateUser = (user, next) => {
  if (process.browser) {
    if (localStorage.getItem('user')) {
      let auth = JSON.parse(localStorage.getItem('user'))
      auth = user
      localStorage.setItem('user', JSON.stringify(auth))
      next()
    }
  }
}