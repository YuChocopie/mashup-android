import styled from "styled-components"
import { themeGet } from "styled-system"

const HeaderWrapper = styled.header`
  position: relative;
  z-index: 99999;
  transition: 0.25s ease-in-out;
`

export const NavbarWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30px 75px;
  background-color: #fff;
  transition: 0.25s ease-in-out;
  @media (max-width: 1400px) {
    padding: 25px 45px;
  }
  @media (max-width: 990px) {
    padding: 15px 25px;
  }
  @media (max-width: 575px) {
    padding: 3px 15px;
  }
`

export const Logo = styled.div`
  margin-right: 50px;
  flex-shrink: 0;
  @media (max-width: 990px) {
    margin: 0 25px;
  }
  @media (max-width: 575px) {
    max-width: 90px;
  }
  img {
    display: block;
    width: 100%;
    max-width: 150px;
    height: auto;
  }
`

export const MenuWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  @media (max-width: 990px) {
    display: none;
  }
`

export const MenuItemWrapper = styled.ul`
  display: flex;
  align-items: center;
  margin-left: auto;
`

export const MenuItem = styled.li`
  margin: 0 20px;
  list-style: none;
  a {
    padding: 5px 10px;
    white-space: nowrap;
    font-size: ${themeGet("fontSizes.3", "15")}px;
    line-height: ${themeGet("lineHeights.normal", "1")};
    font-weight: ${themeGet("fontWeights.3", "400")};
    color: ${themeGet("colors.lightTextColor", "#757575")};
    transition: 0.15s ease-in-out;

    &:hover {
      color: ${themeGet("colors.textColor", "#292929")};
    }
    &.active-link {
      color: ${themeGet("colors.textColor", "#292929")};
      font-weight: ${themeGet("fontWeights.4", "500")};
    }
  }
`

export const NavSearchButton = styled.button`
  background: transparent;
  border: 0;
  outline: 0;
  padding: 5px 0 5px 10px;
  margin-left: 15px;
  cursor: pointer;
  @media (max-width: 990px) {
    margin-left: 0;
  }
  svg {
    display: block;
  }
`

export const SearchCloseButton = styled.button`
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  outline: none;
  position: relative;
  cursor: pointer;
  z-index: 1;
  padding: 0;
  color: #757575;
  font-size: 45px;
  margin-left: -54px;
  @media (max-width: 990px) {
    font-size: 35px;
  }
  @media (max-width: 767px) {
    font-size: 30px;
  }
  svg {
    display: block;
  }
`

export const NavSearchWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  height: 0;
  visibility: hidden;
  transition: 0.35s ease-in-out;

  > * {
    opacity: 0;
    transition: 0.35s ease-in-out;
  }

  &.expand {
    height: 145px;
    visibility: visible;
    @media (max-width: 1199px) {
      height: 120px;
    }
    @media (max-width: 990px) {
      height: 100px;
    }
    @media (max-width: 767px) {
      height: 75px;
    }
    .nav-search-input,
    > * {
      opacity: 1;
    }
  }

  .nav-search-input {
    width: 870px;
    transition: 0.35s ease-in-out;

    .inner-wrap {
      .search-icon {
        width: 70px;
      }
      input,
      .icon-left {
        height: 54px;
        padding: 0 70px;
        border-radius: 3px;
        ::placeholder {
          color: #757575;
        }
      }
    }
  }
`

export const NavSearchFromWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: auto;
  width: 100%;
  height: 100%;
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
    padding: 0 45px;
  }
  @media (max-width: 767px) {
    padding: 0 25px;
  }
`

export const MobileMenuWrapper = styled.div`
  @media (min-width: 991px) {
    display: none;
  }
`

export const DrawerContentWrapper = styled.div`
  .mobile-menu {
    display: block;
    padding-top: 60px;
    li {
      margin: 0 0 38px 0;
      a {
        display: block;
        position: relative;
        padding-left: 30px;
        padding-right: 30px;
        &.active-link {
          &:before {
            opacity: 1;
          }
        }
        &:before {
          content: "";
          position: absolute;
          width: 3px;
          height: 18px;
          top: 50%;
          left: 0;
          opacity: 0;
          background: ${themeGet("colors.textColor", "#292929")};
          transform: translateY(-50%);
        }
      }
    }
  }
`

export const DrawerHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dbdbdb;
  padding: 3px 0;
`

export const DrawerLogo = styled.div`
  max-width: 110px;
  padding-left: 30px;
  img {
    max-width: 100%;
  }
`

export const DrawerClose = styled.div`
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
  padding: 0 15px;
`

export const HamburgerIcon = styled.div`
  width: 30px;
  height: 45px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  span {
    display: block;
    height: 2px;
    background-color: ${themeGet("colors.textColor", "#292929")};
    margin-bottom: 5px;
    &:last-child {
      margin-bottom: 0;
      width: 20px;
    }
  }
`

export default HeaderWrapper
