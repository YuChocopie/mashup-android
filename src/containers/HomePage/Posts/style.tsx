import styled from "styled-components"
import { themeGet } from "styled-system"

const BlogPostsWrapper = styled.div`
  margin: 0 auto;
  position: relative;
  .post_card {
    margin-bottom: 120px;
    @media (max-width: 990px) {
      margin-bottom: 90px;
    }
    @media (max-width: 575px) {
      margin-bottom: 60px;
    }
  }
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
    padding: 0 45px 0 45px;
  }
  @media (max-width: 575px) {
    padding: 0 25px 0 25px;
  }
`

export const SecTitle = styled.div`
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

export default BlogPostsWrapper
