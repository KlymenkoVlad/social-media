import axios from 'axios';
import cookie from 'js-cookie';
import baseUrl from './baseUrl';
import catchErrors from './catchErrors';

const Axios = axios.create({
  baseURL: `${baseUrl}/api/profile`,
  headers: { Authorization: cookie.get('token') },
});

export const followUser = async (userToFollowId, setLoggedUserFollowStats) => {
  try {
    await Axios.post(`/follow/${userToFollowId}`);

    setLoggedUserFollowStats((prev) => ({
      ...prev,
      following: [...prev.following, { user: userToFollowId }],
    }));
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const unfollowUser = async (userToUnFollowId, setLoggedUserFollowStats) => {
  try {
    await Axios.put(`/unfollow/${userToUnFollowId}`);

    setLoggedUserFollowStats((prev) => ({
      ...prev,
      following: prev.following.filter((following) => following.user !== userToUnFollowId),
    }));
  } catch (error) {
    alert(catchErrors(error));
  }
};
