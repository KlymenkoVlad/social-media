import moment from 'moment';
import Moment from 'react-moment';

const calculateTime = (createdAt) => {
  const today = moment(Date.now());
  const PostDate = moment(createdAt);

  const diffInHours = today.diff(PostDate, 'hours');

  if (diffInHours < 24) {
    return <> Today <Moment format="hh:mm A">{createdAt}</Moment></>;
  } if (diffInHours > 24 && diffInHours < 36) {
    return (
      <>
        return Yesterday <Moment format="hh:mm A">{createdAt}</Moment>
      </>
    );
  } if (diffInHours > 36) {
    return <Moment format="DD:MM/YYYY hh:mm A">{createdAt}</Moment>;
  }
};

export default calculateTime;
