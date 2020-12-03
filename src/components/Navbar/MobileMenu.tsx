import React, { useContext } from "react"
import { Link } from "gatsby"
import Drawer from "../Drawer/Drawer"
import { DrawerContext } from "../Drawer/DrawerContext"
import Menu from "./Menu"
import {
  MobileMenuWrapper,
  DrawerContentWrapper,
  DrawerHead,
  DrawerLogo,
  DrawerClose,
  HamburgerIcon,
} from "./Navbar.style"
import { FiX } from "react-icons/fi"

type MobileMenuProps = {
  items: any
  logo: string
}

const MobileMenu: React.FunctionComponent<MobileMenuProps> = ({
  items,
  logo,
  ...props
}) => {
  const { state, dispatch }: any = useContext(DrawerContext)

  // Toggle drawer
  const toggleDrawer = () => {
    dispatch({
      type: "TOGGLE",
    })
  }

  return (
    <MobileMenuWrapper {...props}>
      <Drawer
        width="285px"
        placement="left"
        drawerHandler={
          <HamburgerIcon>
            <span />
            <span />
            <span />
          </HamburgerIcon>
        }
        open={state.isOpen}
        toggleHandler={toggleDrawer}
      >
        <DrawerContentWrapper>
          <DrawerHead>
            <DrawerLogo>
              <Link to="/">
                <img src={logo} alt="logo" />
              </Link>
            </DrawerLogo>
            <DrawerClose onClick={toggleDrawer}>
              <FiX />
            </DrawerClose>
          </DrawerHead>
          <Menu items={items} className="mobile-menu" />
        </DrawerContentWrapper>
      </Drawer>
    </MobileMenuWrapper>
  )
}

export default MobileMenu
