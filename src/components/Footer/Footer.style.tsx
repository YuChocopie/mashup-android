import styled from 'styled-components';
import { themeGet } from 'styled-system';

const FooterWrapper = styled.footer`
  position: relative;
  overflow: hidden;
  color: ${themeGet('colors.textColor', '#292929')};
  font-size: ${themeGet('fontSizes.3', '15')}px;
  padding: 30px 15px;
  text-align: center;
  border-top: 1px solid #f3f3f3;
  margin-top: 120px;
  @media (max-width: 1200px) {
    margin-top: 90px;
  }
  @media (max-width: 990px) {
    margin-top: 90px;
  }
  @media (max-width: 575px) {
    margin-top: 60px;
    padding: 22px 15px;
  }

  a {
    color: ${themeGet('colors.textColor', '#292929')};
    font-size: ${themeGet('fontSizes.3', '15')}px;
    transition: 0.15s ease-in-out;
    &:hover {
      color: ${themeGet('colors.primary', '#ff176a')};
    }
  }
`;

export default FooterWrapper;
