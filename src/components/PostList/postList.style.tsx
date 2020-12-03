import styled from 'styled-components';
import { themeGet } from 'styled-system';

export const PostListWrapper = styled.div`
  a {
    display: flex;
    align-items: center;
    position: relative;
    padding: 30px 60px 30px 30px;
    @media (max-width: 990px) {
      padding: 25px;
    }
    @media (max-width: 575px) {
      padding: 15px 20px;
    }
  }
`;

export const PostPreview = styled.div`
  flex: 0 0 62px;
  flex-shrink: 0;
  margin-right: 30px;
  border-radius: 3px;
  overflow: hidden;
  @media (max-width: 990px) {
    flex: 0 0 52px;
    margin-right: 20px;
  }
`;

export const PostDetails = styled.div`
  flex-grow: 1;
`;

export const PostTitle = styled.h1`
  font-size: 21px;
  font-weight: 700;
  color: ${themeGet('colors.textColor', '#292929')};
  line-height: 1.53;
  margin-bottom: 12px;
  a {
    color: ${themeGet('colors.textColor', '#292929')};
  }
  @media (max-width: 990px) {
    font-size: 16px;
    margin-bottom: 10px;
  }
  @media (max-width: 575px) {
    font-size: 14px;
    margin-bottom: 8px;
  }
`;

export const PostMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const PostDate = styled.div`
  font-size: 15px;
  font-weight: normal;
  color: ${themeGet('colors.textColor', '#292929')};
  @media (max-width: 575px) {
    font-size: 13px;
  }
`;

export const PostTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  @media (max-width: 575px) {
    display: none;
  }

  a,
  span {
    display: block;
    margin-left: 30px;
    font-size: 14px;
    font-weight: 400;
    color: ${themeGet('primary', '#ff176a')};
    @media (max-width: 990px) {
      font-size: 13px;
      margin-left: 25px;
    }
  }
`;
