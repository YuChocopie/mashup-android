import styled from "styled-components"
import { themeGet } from "styled-system"

export const AboutWrapper = styled.div`
  position: relative;
  padding: 90px 75px 0 75px;
  @media (max-width: 990px) {
    padding: 80px 45px 30px 45px;
  }
  @media (max-width: 575px) {
    padding: 60px 25px 0 25px;
  }
`

export const AboutPageTitle = styled.div`
  word-break: keep-all;
  margin-bottom: 45px;
  @media (max-width: 767px) {
    margin-bottom: 30px;
  }
  h2 {
    font-size: 30px;
    font-weight: 700;
    color: ${themeGet("colors.textColor", "#292929")};
    line-height: 1.53;
    margin-bottom: 10px;
    @media (max-width: 990px) {
      font-size: 26px;
    }
    @media (max-width: 767px) {
      font-size: 22px;
      margin-bottom: 10px;
    }
  }
`

export const AboutImage = styled.div`
  margin-bottom: 90px;
  @media (max-width: 990px) {
    margin-bottom: 60px;
  }
  @media (max-width: 767px) {
    margin-bottom: 40px;
  }
`

export const AboutDetails = styled.div`
  width: 870px;
  max-width: 100%;
  margin: 0 auto;

  h2 {
    font-size: 21px;
    font-weight: 500;
    color: ${themeGet("colors.textColor", "#292929")};
    margin-bottom: 40px;
    @media (max-width: 990px) {
      margin-bottom: 30px;
    }
    @media (max-width: 767px) {
      font-size: 18px;
      margin-bottom: 25px;
    }
  }
`
export const SocialProfiles = styled.div`
  margin-top: 60px;
  position: relative;
  @media (max-width: 767px) {
    margin-top: 40px;
  }

  &:before {
    content: "";
    width: 30px;
    height: 1px;
    background: #292929;
    display: block;
    margin-bottom: 60px;
    @media (max-width: 767px) {
      margin-bottom: 40px;
    }
  }
`
