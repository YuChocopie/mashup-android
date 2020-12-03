import styled from 'styled-components';
import { themeGet } from 'styled-system';

export const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const PrevPage = styled.div`
  min-width: 32px;
  a {
    width: 32px;
    height: 32px;
    color: ${themeGet('colors.textColor', '#292929')};
    border-radius: 50%;
    background-color: #f3f3f3;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.15s ease-in-out;
    svg {
      display: block;
    }
    &:hover {
      color: #fff;
      background-color: ${themeGet('colors.primary', '#ff176a')};
    }
  }
`;

export const NextPage = styled.div`
  min-width: 32px;
  a {
    width: 32px;
    height: 32px;
    color: ${themeGet('colors.textColor', '#292929')};
    border-radius: 50%;
    background-color: #f3f3f3;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.15s ease-in-out;
    svg {
      display: block;
    }
    &:hover {
      color: #fff;
      background-color: ${themeGet('colors.primary', '#ff176a')};
    }
  }
`;

export const PageNumber = styled.div``;
