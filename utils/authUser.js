import axios from 'axios';
import Router from 'next/router';
import cookie from 'js-cookie';

import baseUrl from './baseUrl';
import catchErors from './catchErrors';

const setToken = (token) => {
  cookie.set('token', token);
  Router.push('/');
};

export const registerUser = async (user, profilePicUrl, setError, setLoading) => {
  try {
    const res = await axios.post(`${baseUrl}/api/signup`, { user, profilePicUrl });

    setToken(res.data);
  } catch (error) {
    const errorMsg = catchErors(error);
    setError(errorMsg);
  }
  setLoading(false);
};

export const redirectUser = (ctx, location) => {
  if (ctx.req) {
    ctx.res.writeHead(302, { Location: location });
    ctx.res.end();
  } else {
    Router.push(location);
  }
};

export const loginUser = async (user, setError, setLoading) => {
  setLoading(true);
  try {
    const res = await axios.post(`${baseUrl}/api/auth`, { user });

    setToken(res.data);
  } catch (error) {
    const errorMsg = catchErors(error);
    setError(errorMsg);
  }
  setLoading(false);
};

export const logoutUser = (email) => {
  cookie.set('userEmail', email);
  cookie.remove('token');
  Router.push('/login');
  Router.reload();
};
