import styled from 'styled-components';
import { themeGet } from 'styled-system';

type ButtonStyleProps = {
  fullwidth?: boolean;
};

const ButtonStyle = styled('button')<ButtonStyleProps>`
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${themeGet('colors.white', '#fff')};
  background-color: ${themeGet('colors.black', '#292929')};
  height: ${themeGet('heights.2', '44')}px;
  width: ${props => (props.fullwidth ? '100%' : 'auto')};
  font-family: ${themeGet('fontFamily.0', "'Fira Sans', sans-serif")};
  font-size: ${themeGet('fontSizes.3', '15')}px;
  font-weight: ${themeGet('fontWeights.4', '500')};
  text-decoration: none;
  padding-top: 0;
  padding-bottom: 0;
  padding-left: 27px;
  padding-right: 27px;
  border: 0;
  transition: all 0.3s ease;
  span.btn-text {
    padding-left: 4px;
    padding-right: 4px;
  }
  span.btn-icon {
    display: flex;
    > div {
      display: flex !important;
    }
  }

  &:focus {
    outline: none;
  }

  &.disabled {
    color: ${themeGet('inactiveColor', '#767676')};
    background-color: ${themeGet('inactiveBG', '#e6e6e6')};
    border-color: ${themeGet('inactiveBG', '#e6e6e6')};

    &:hover {
      color: ${themeGet('inactiveColor', '#767676')};
      background-color: ${themeGet('inactiveBG', '#e6e6e6')};
      border-color: ${themeGet('inactiveBG', '#e6e6e6')};
    }
  }

  &.is-loading {
    .btn-text {
      padding-left: 8px;
      padding-right: 8px;
    }
  }
`;

ButtonStyle.displayName = 'ButtonStyle';

export default ButtonStyle;
