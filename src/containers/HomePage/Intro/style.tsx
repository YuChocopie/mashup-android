import styled from "styled-components"
import { themeGet } from "styled-system"

export const IntroWrapper = styled.div`
  width: 940px;
  max-width: 100%;
  margin: 0 auto;
  padding: 150px 10px 150px 10px;
  display: flex;
  align-items: center;
  @media (max-width: 1400px) {
    padding: 120px 10px 120px 10px;
  }
  @media (max-width: 1200px) {
    padding: 100px 10px 100px 10px;
  }
  @media (max-width: 990px) {
    padding: 70px 25px 80px 25px;
  }
  @media (max-width: 575px) {
    display: block;
    padding: 50px 25px 80px 25px;
    text-align: center;
  }
`

export const IntroImage = styled.div`
  width: 270px;
  height: 270px;
  padding: 30px;
  border-radius: 50%;
  margin: 0 auto;
  border: 1px solid ${themeGet("colors.lightBorderColor", "#ffffff")};
  flex-shrink: 0;
  @media (max-width: 990px) {
    width: 220px;
    height: 220px;
    padding: 25px;
    margin-bottom: 25px;
  }
  @media (max-width: 990px) {
    width: 180px;
    height: 180px;
    padding: 20px;
    margin-bottom: 20px;
  }

  img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 50%;
  }

  > div {
    border-radius: 50%;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.16);
  }
`

export const IntroTitle = styled.h1`
  font-size: 30px;
  font-weight: 400;
  font-family: ${themeGet("fontFamily.1", "'Poppins', sans-serif")};
  color: ${themeGet("colors.textColor", "#292929")};
  margin-bottom: 20px;
  @media (max-width: 990px) {
    font-size: 26px;
    margin-bottom: 15px;
  }
  @media (max-width: 575px) {
    font-size: 22px;
  }
`

export const Desciption = styled.p`
  color: ${themeGet("colors.textColor", "#292929")};
  font-size: ${themeGet("fontSizes.3", "15")}px;
  line-height: ${themeGet("lineHeights.text", "2")};
  word-break: keep-all;
`

export const IntroInfo = styled.div`
  padding-left: 30px;
  @media (max-width: 575px) {
    padding-left: 0;
  }
`
