import styled from "styled-components"
import { themeGet } from "styled-system"

export const BlogPostsWrapper = styled.div`
  margin: 0 auto;
  padding-top: 120px;
  position: relative;

  @media (min-width: 990px) {
    width: 900px;
  }
  @media (min-width: 1200px) {
    width: 920px;
  }
  @media (min-width: 1400px) {
    width: 960px;
  }
  @media (max-width: 990px) {
    padding: 80px 45px 0 45px;
  }
  @media (max-width: 575px) {
    padding: 60px 25px 0 25px;
  }

  .post_card {
    margin-bottom: 120px;
    @media (max-width: 990px) {
      margin-bottom: 90px;
    }
    @media (max-width: 575px) {
      margin-bottom: 60px;
    }
  }
`

export const RelatedPostWrapper = styled.div`
  margin: 0 auto;
  padding-left: 75px;
  padding-right: 75px;
  @media (min-width: 1550px) {
    width: 1500px;
    padding-left: 0;
    padding-right: 0;
  }
  @media (max-width: 990px) {
    padding: 0 45px 0 45px;
  }
  @media (max-width: 575px) {
    padding: 0 25px 0 25px;
  }
`

export const RelatedPostTitle = styled.h2`
  color: ${themeGet("colors.textColor", "#292929")};
  font-size: 16px;
  font-weight: 500;
  font-family: ${themeGet("fontFamily.0", "'Fira Sans',sans-serif")};
  letter-spacing: 0.17em;
  position: relative;
  margin-bottom: 30px;

  &:after {
    content: "";
    width: 68px;
    height: 1px;
    background: #292929;
    display: block;
    margin-top: 8px;
  }
`

export const RelatedPostItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
`

export const RelatedPostItem = styled.div`
  flex: 0 0 33.333333333%;
  max-width: 33.333333333%;
  padding: 0 15px;
  @media (max-width: 575px) {
    flex: 0 0 100%;
    max-width: 100%;
    &:nth-child(n + 2) {
      margin-top: 50px;
    }
  }
  .post_card {
    &:hover {
      .post_preview {
        a {
          transform: scale(1.05);
        }
      }
    }

    .post_preview {
      margin-bottom: 16px;
      overflow: hidden;
      a {
        display: block;
        transition: 0.25s ease-in-out;
      }
      &:before {
        filter: blur(10px);
      }
    }
    .post_title {
      font-size: 21px;
      a {
        display: block;
        white-space: nowrap;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      @media (max-width: 1400px) {
        font-size: 19px;
      }
      @media (max-width: 1200px) {
        font-size: 17px;
      }
      @media (max-width: 990px) {
        font-size: 15px;
      }
    }
    .post_content {
      max-width: 100%;
    }

    .post_tags {
      margin-top: 20px;
      a {
        @media (max-width: 990px) {
          font-size: 12px;
          margin-right: 15px;
        }
      }
    }
  }
`
export const TagPostsWrapper = styled.div`
  margin: 0 auto;
  padding-top: 120px;
  position: relative;
  @media (min-width: 990px) {
    width: 900px;
  }
  @media (min-width: 1200px) {
    width: 1050px;
  }
  @media (min-width: 1400px) {
    width: 1170px;
  }
  @media (max-width: 990px) {
    padding: 80px 45px 30px 45px;
  }
  @media (max-width: 575px) {
    padding: 60px 25px 0 25px;
  }

  .post_card {
    margin-bottom: 120px;
    &:last-child {
      margin-bottom: 0;
    }
    @media (max-width: 990px) {
      margin-bottom: 80px;
    }
    @media (max-width: 575px) {
      margin-bottom: 60px;
    }
  }
`
export const TagPageHeading = styled.div`
  padding-left: 210px;
  font-size: 15px;
  font-weight: 400;
  margin-bottom: 120px;
  position: relative;
  @media (max-width: 1200px) {
    padding-left: 160px;
  }
  @media (max-width: 990px) {
    padding-left: 0;
    font-size: 13px;
    margin-bottom: 80px;
  }
  @media (max-width: 575px) {
    margin-bottom: 60px;
  }

  &:after {
    content: "";
    display: block;
    width: 90px;
    height: 1px;
    background: #292929;
    margin-top: 15px;
  }
`

export const TagName = styled.h1`
  font-size: 30px;
  font-weight: 700;
  color: ${themeGet("colors.primary", "#ff176a")};
  margin-bottom: 8px;
  @media (max-width: 990px) {
    font-size: 26px;
  }
  @media (max-width: 575px) {
    font-size: 22px;
  }
`
export const BlogPostFooter = styled.div`
  margin: 0 auto;
  width: 58%;
  max-width: 100%;
  padding-top: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media (max-width: 990px) {
    padding-top: 40px;
    width: 100%;
  }
  &.center {
    margin: 0 auto;
  }
`

export const BlogPostComment = styled.div`
  margin: 0 0 0 auto;
  width: 58%;
  max-width: 100%;
  padding-top: 80px;
  @media (max-width: 990px) {
    padding-top: 60px;
    width: 100%;
  }
  &.center {
    margin: 0 auto;
  }
`

export const PostShare = styled.div`
  display: flex;
  align-items: center;
  > span {
    flex-shrink: 0;
  }
  > div,
  .SocialMediaShareButton {
    cursor: pointer;
    margin-left: 25px;
    font-size: 22px;
    outline: 0;
    color: ${themeGet("colors.textColor", "#292929")};
    transition: 0.15s ease-in-out;
    @media (max-width: 767px) {
      font-size: 18px;
      margin-left: 20px;
    }
    &:hover {
      color: ${themeGet("colors.primary", "#ff176a")};
    }
    svg {
      display: block;
    }
  }
`

export const BlogPostDetailsWrapper = styled.div`
  margin: 0 auto;
  padding: 90px 0 120px 0;
  padding-left: 75px;
  padding-right: 75px;
  @media (min-width: 1550px) {
    width: 1500px;
    padding-left: 0;
    padding-right: 0;
  }
  @media (max-width: 1199px) {
    padding: 80px 35px 80px 35px;
  }
  @media (max-width: 575px) {
    padding: 60px 25px 60px 25px;
  }
`

export const PostTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  @media (max-width: 575px) {
    display: none;
  }

  a {
    display: block;
    margin-right: 30px;
    font-size: 14px;
    font-weight: 400;
    color: ${themeGet("primary", "#ff176a")};
    @media (max-width: 990px) {
      font-size: 13px;
      margin-right: 25px;
    }
  }
`
