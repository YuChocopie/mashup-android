import styled from "styled-components"
import { themeGet } from "styled-system"

export const SearchWrapper = styled.div`
  display: block;
  flex-grow: 1;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
`

export const SearchForm = styled.form`
  width: calc(100% - 60px);
  input {
    width: 100%;
    font-size: 21px;
    font-weight: normal;
    color: ${themeGet("colors.textColor", "#292929")};
    border: 0;
    background: transparent;
    &:focus {
      outline: none;
    }
    @media (max-width: 990px) {
      font-size: 18px;
    }
    @media (max-width: 767px) {
      font-size: 15px;
    }
  }
`

export const SearchResult = styled.div`
  position: absolute;
  width: 100%;
  background: #fff;
  top: 100%;
  left: 0;
  display: block;
  box-shadow: 0 30px 30px rgba(0, 0, 0, 0.08);

  .post_list {
    border-bottom: 1px solid #f3f3f3;
    &:last-child {
      border: 0;
    }
  }

  .search-scrollbar {
    @media (max-height: 700px) {
      max-height: 400px !important;
    }
    > div {
      @media (max-height: 700px) {
        max-height: 400px !important;
      }
    }
  }
`

export const SearchResultContainer = styled.div`
  max-height: 405px;
  overflow-x: hidden;
`

export const NoResult = styled.div`
  padding: 30px;
  font-size: 30px;
  text-align: center;
  color: #cccccc;
  @media (max-width: 990px) {
    font-size: 24px;
    padding: 25px;
  }
  @media (max-width: 767px) {
    font-size: 18px;
    padding: 20px;
  }
`
