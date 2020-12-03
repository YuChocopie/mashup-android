import styled from "styled-components"
import { themeGet } from "styled-system"

export const ContactWrapper = styled.div`
  width: 870px;
  margin: 0 auto;
  padding-top: 120px;
  max-width: 100%;
  @media (max-width: 990px) {
    padding: 80px 45px 30px 45px;
  }
  @media (max-width: 575px) {
    padding: 60px 25px 0 25px;
  }
`

export const ContactPageTitle = styled.div`
  margin-bottom: 90px;
  @media (max-width: 990px) {
    margin-bottom: 60px;
  }
  h2 {
    font-size: 30px;
    font-weight: 700;
    color: ${themeGet("colors.textColor", "#292929")};
    line-height: 1.53;
    margin-bottom: 15px;
    @media (max-width: 990px) {
      font-size: 26px;
      margin-bottom: 12px;
    }
    @media (max-width: 575px) {
      font-size: 22px;
      margin-bottom: 10px;
    }
  }
`

export const ContactFromWrapper = styled.div`
  position: relative;
  .button {
    margin-top: 60px;
    @media (max-width: 575px) {
      margin-top: 40px;
    }
  }
`

export const InputGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .field-wrapper {
    flex-grow: 1;
    max-width: calc(50% - 30px);
    margin-bottom: 60px;
    @media (max-width: 575px) {
      max-width: 100%;
      margin-bottom: 40px;
    }
  }
`
