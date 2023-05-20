import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { parseCookies } from 'nookies';
import {
  Segment,
  Header,
  Divider,
  Comment,
  Grid,
  Icon,
} from 'semantic-ui-react';
import { useRouter } from 'next/router';

import Chat from '../components/Chats/Chat';
import ChatListSearch from '../components/Chats/ChatListSearch';
import { NoMessages } from '../components/Layout/NoData';
import baseUrl from '../utils/baseUrl';

import Banner from '../components/Messages/Banner';
import Message from '../components/Messages/Message';
import MessageInputField from '../components/Messages/MessageInputField';

function Messages({ chatsData, user }) {
  const router = useRouter();

  const [chats, setChats] = useState(chatsData);
  const [connectedUsers, setConnectedUsers] = useState([]);

  const socket = useRef();

  const [messages, setMessages] = useState([]);
  const [bannerData, setBannerData] = useState({ name: '', profilePicUrl: '' });
  /* Ref for persisiting the state of query string in url throughout re-renders, 
  ref is query string inside url */
  const openChatId = useRef('');

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl);
    }

    if (socket.current) {
      socket.current.emit('join', { userId: user._id });

      socket.current.on('connectedUsers', ({ users }) => {
        users.length > 0 && setConnectedUsers(users);
      });
    }

    if (chats.length > 0 && !router.query.message)
      router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
        shallow: true,
      });

    return () => {
      if (socket.current) {
        socket.current.emit('disconnect');
        socket.current.off();
      }
    };
  }, []);

  useEffect(() => {
    const loadMessages = () => {
      socket.current.emit('loadMessages', {
        userId: user._id,
        messagesWith: router.query.message,
      });

      socket.current.on('messagesLoaded', ({ chat }) => {
        // ? Why chat returns two times---------------------------------------
        console.log(chat);
        // ?-------------------------------------------------------------------

        setMessages(chat.messages);
        setBannerData({
          name: chat.messagesWith.name,
          profilePicUrl: chat.messagesWith.profilePicUrl,
        });

        openChatId.current = chat.messagesWith._id;
      });
    };

    if (socket.current) {
      loadMessages();
    }
  }, [router.query.message]);

  return (
    <Segment padded basic size="large" style={{ marginTop: '5px' }}>
      <Header
        icon="home"
        content="Go Back!"
        onClick={() => router.push('/')}
        style={{ cursor: 'pointer' }}
      />
      <Divider hidden />

      <div style={{ marginBottom: '10px' }}>
        <ChatListSearch chats={chats} setChats={setChats} />
      </div>

      {chats.length > 0 ? (
        <Grid stackable>
          <Grid.Column width={4}>
            <Comment.Group size="big">
              <Segment raised style={{ overflow: 'auto', maxHeight: '32rem' }}>
                {chats.map((chat, i) => (
                  <Chat
                    connectedUsers={connectedUsers}
                    key={i}
                    chat={chat}
                    setChats={setChats}
                  />
                ))}
              </Segment>
            </Comment.Group>
          </Grid.Column>

          <Grid.Column width={12}>
            {router.query.message && (
              <>
                <div
                  style={{
                    overflow: 'auto',
                    overflowX: 'hidden',
                    maxHeight: '35rem',
                    height: '35rem',
                    backgroundColor: 'whitesmoke',
                  }}
                >
                  {messages.length > 0 && (
                    <>
                      <div style={{ position: 'sticky', top: '0' }}>
                        <Banner bannerData={bannerData} />
                      </div>

                      {messages.map((message, i) => (
                        <Message
                          key={i}
                          bannerProfilePic={bannerData.profilePicUrl}
                          message={message}
                          user={user}
                          setMessages={setMessages}
                          messagesWith={openChatId.current}
                        />
                      ))}
                    </>
                  )}
                </div>

                <MessageInputField
                  socket={socket.current}
                  user={user}
                  messagesWith={openChatId.current}
                />
              </>
            )}
          </Grid.Column>
        </Grid>
      ) : (
        <NoMessages />
      )}
    </Segment>
  );
}

export default Messages;

export const getServerSideProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/chats`, {
      headers: { Authorization: token },
    });

    return { props: { chatsData: res.data } };
  } catch (error) {
    return { props: { errorLoading: true } };
  }
};
