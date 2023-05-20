import React from 'react';
import { Segment, Image, Grid } from 'semantic-ui-react';

function Banner({ bannerData }) {
  const { name, profilePicUrl } = bannerData;

  return (
    <Segment color="teal" attached="top">
      <Grid.Column floated="left" width={14}>
        <h4>
          <Image avatar src={profilePicUrl} />
          {name}
        </h4>
      </Grid.Column>
    </Segment>
  );
}

export default Banner;
