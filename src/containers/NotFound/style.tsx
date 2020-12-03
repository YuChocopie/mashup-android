import styled from "styled-components"
import { themeGet } from "styled-system"

export const NotFoundWrapper = styled.div`
  position: relative;
  margin: 0 auto;
  padding: 120px 0 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
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
    padding: 80px 45px 0 45px;
  }
  @media (max-width: 575px) {
    padding: 60px 25px 0 25px;
  }
`

export const NotFoundContent = styled.div`
  flex: 0 0 35%;
  max-width: 35%;
  padding-right: 100px;
  @media (max-width: 1400px) {
    flex: 0 0 45%;
    max-width: 45%;
  }
  @media (max-width: 990px) {
    flex: 0 0 55%;
    max-width: 55%;
    padding-right: 50px;
  }
  @media (max-width: 575px) {
    flex: 0 0 100%;
    max-width: 100%;
    padding-right: 0;
    order: 1;
  }
  h1 {
    @media (max-width: 990px) {
      font-size: 24px;
    }
    @media (max-width: 575px) {
      font-size: 22px;
    }
  }
`

export const NotFoundImage = styled.div`
  flex: 0 0 65%;
  max-width: 65%;
  padding-left: 10px;
  @media (max-width: 1400px) {
    flex: 0 0 55%;
    max-width: 55%;
  }
  @media (max-width: 990px) {
    flex: 0 0 45%;
    max-width: 45%;
  }
  @media (max-width: 575px) {
    flex: 0 0 100%;
    max-width: 100%;
    margin-bottom: 50px;
  }
`

export const Icon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dbdbdb;
  color: #fff;
  font-size: 16px;
  margin-right: 15px;
  transition: 0.15s ease-in-out;
`

export const Goback = styled.div`
  margin-top: 60px;
  @media (max-width: 990px) {
    margin-top: 40px;
  }
  @media (max-width: 575px) {
    margin-top: 30px;
  }
  a {
    display: inline-flex;
    align-items: center;
    font-size: 15px;
    font-weight: 500;
    color: ${themeGet("colors.textColor", "#292929")};
    transition: 0.15s ease-in-out;
    &:hover {
      color: ${themeGet("colors.primary", "#ff176a")};
      ${Icon} {
        background-color: ${themeGet("colors.primary", "#ff176a")};
      }
    }
  }
`
