import { Message, Button } from 'semantic-ui-react';

export function NoProfilePosts() {
  return (
    <>
      <Message
        info
        icon="meh"
        header="Sorry"
        content="User has not posted anything yet!"
      />
      <Button
        icon="long arrow alternate left"
        content="Go Back"
        as="a"
        href="/"
      />
    </>
  );
}

export function NoFollowData({ followersComponent, followingComponent }) {
  return (
    <>
      {followersComponent && (
        <Message
          icon="user outline"
          info
          content="User does not have followers"
        />
      )}

      {followingComponent && (
        <Message
          icon="user outline"
          info
          content="User does not follow any users"
        />
      )}
    </>
  );
}

export function NoMessages() {
  return (
    <Message
      info
      icon="telegram plane"
      header="Sorry"
      content="You have not messaged anyone yet.Search above to message someone!"
    />
  );
}

export function NoPosts() {
  return (
    <Message
      info
      icon="meh"
      header="Hey!"
      content="No Posts. Make sure you have followed someone."
    />
  );
}

export function NoPostFound() {
  return (
    <Message info icon="meh" header="Hey!" content="This Post doesn`t exist" />
  );
}

export function NoProfile() {
  return <Message info icon="meh" header="Hey!" content="No Profile Found." />;
}
