import * as React from 'react';
import {
  SocialProfileWrapper,
  SocialProfileItem,
  Tooltip,
} from './SocialProfile.style';

type SocialProfileProps = {
  items: Socialitem[];
};

type Socialitem = {
  url: string;
  icon: React.ReactChild;
  tooltip: string;
};

const SocialProfile: React.FunctionComponent<SocialProfileProps> = ({
  items,
  ...props
}) => {
  return (
    <SocialProfileWrapper {...props}>
      {items.map((item, index) => (
        <SocialProfileItem key={index}>
          <a href={item.url} aria-label="social profile">
            {item.icon || 'icon'}
          </a>
          <Tooltip>{item.tooltip || 'Social Link'}</Tooltip>
        </SocialProfileItem>
      ))}
    </SocialProfileWrapper>
  );
};

export default SocialProfile;
