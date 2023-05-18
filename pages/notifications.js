import React, { useEffect, useState } from 'react';
import { Feed, Segment, Divider, Container } from 'semantic-ui-react';
import axios from 'axios';
import { parseCookies } from 'nookies';
import Cookies from 'js-cookie';

import LikeNotification from '../components/Notifications/LikeNotification';
import FollowerNotification from '../components/Notifications/FollowerNotification';
import CommentNotification from '../components/Notifications/CommentNotification';

import { NoNotifications } from '../components/Layout/NoData';
import baseUrl from '../utils/baseUrl';

function Notifications({ notifications, errorLoading, user, userFollowStats }) {
  const [loggedUserFollowStats, setloggedUserFollowStats] =
    useState(userFollowStats);

  useEffect(() => {
    const notificationRead = async () => {
      try {
        await axios.post(
          `${baseUrl}/api/notifications`,
          {},
          { headers: { Authorization: Cookies.get('token') } }
        );
      } catch (error) {
        console.error(error);
      }
    };

    return () => {
      notificationRead();
    };
  }, []);

  return (
    <Container style={{ marginTop: '1.5rem' }}>
      {notifications.length > 0 ? (
        <Segment color="teal" raised>
          <div
            style={{
              maxHeight: '40rem',
              overflow: 'auto',
              height: '40rem',
              position: 'relative',
              width: '100%',
            }}
          >
            <Feed size="small">
              {notifications.map((notification) => (
                <>
                  {notification.type === 'newLike' &&
                    notification.post !== null && (
                      <LikeNotification
                        key={notification._id}
                        notification={notification}
                      />
                    )}

                  {notification.type === 'newComment' &&
                    notification.post !== null && (
                      <CommentNotification
                        key={notification._id}
                        notification={notification}
                      />
                    )}

                  {notification.type === 'newFollower' &&
                    notification.post !== null && (
                      <FollowerNotification
                        key={notification._id}
                        notification={notification}
                        loggedUserFollowStats={loggedUserFollowStats}
                        setloggedUserFollowStats={setloggedUserFollowStats}
                      />
                    )}
                </>
              ))}
            </Feed>
          </div>
        </Segment>
      ) : (
        <NoNotifications />
      )}
      <Divider hidden />
    </Container>
  );
}

export default Notifications;

export const getServerSideProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/notifications`, {
      headers: { Authorization: token },
    });

    return { props: { notifications: res.data } };
  } catch (error) {
    return { props: { errorLoading: true } };
  }
};
