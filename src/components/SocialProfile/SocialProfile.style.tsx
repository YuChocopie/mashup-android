import styled from 'styled-components';
import { themeGet } from 'styled-system';

export const SocialProfileWrapper = styled.ul`
  display: inline-flex;
`;

export const Tooltip = styled.div`
  position: absolute;
  background-color: #fff;
  pointer-events: none;
  padding: 0.4rem 0.8rem;
  border-radius: 3px;
  color: #333;
  font-size: 13px;
  bottom: 90%;
  left: 50%;
  opacity: 0;
  white-space: nowrap;
  visibility: hidden;
  z-index: 999;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  transform: translate3d(-50%, 0, 0);
  transition: 0.35s cubic-bezier(0.165, 0.84, 0.44, 1);

  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-top: 6px solid #fff;
    border-right: 6px solid transparent;
    border-left: 6px solid transparent;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

export const SocialProfileItem = styled.li`
  list-style: none;
  position: relative;
  margin-right: 20px;
  &:last-child {
    margin-right: 0;
  }
  &:hover {
    ${Tooltip} {
      opacity: 1;
      visibility: visible;
      bottom: calc(100% + 5px);
    }
  }

  a {
    color: ${themeGet('colors.textColor', '#292929')};
    font-size: 22px;
    padding: 0.2em;
    display: block;
    svg {
      display: block;
    }
  }
`;
