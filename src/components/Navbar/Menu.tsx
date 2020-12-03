import React from "react"
import { Link } from "gatsby"
import { MenuItemWrapper, MenuItem } from "./Navbar.style"

type MenuProps = {
  items: MenuItemsProps[]
  className?: string
}

type MenuItemsProps = {
  url: string
  label: string
  external?: boolean
}

const Menu: React.FunctionComponent<MenuProps> = ({
  items,
  className,
  ...props
}) => {
  // Add all classs to an array
  const addAllClasses = ["menu"]

  // className prop checking
  if (className) {
    addAllClasses.push(className)
  }

  return (
    <MenuItemWrapper className={addAllClasses.join(" ")} {...props}>
      {items.map((item, index) => (
        <MenuItem key={index}>
          {item.external ? (
            <a href={item.url}>{item.label}</a>
          ) : (
            <Link to={item.url} activeClassName="active-link">
              {item.label}
            </Link>
          )}
        </MenuItem>
      ))}
    </MenuItemWrapper>
  )
}

export default Menu
