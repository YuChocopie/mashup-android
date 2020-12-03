import React from "react"
import Sticky from "react-stickynode"
import { ThemeProvider } from "styled-components"
import ScrollToTop from "react-scroll-up"
import Navbar from "./Navbar/Navbar"
import Footer from "./Footer/Footer"
import ScrollUpButton from "./ScrollUpButton/ScrollUpButton"
import ResetCss from "./resetCSS"
import { theme } from "../theme"

type LayoutProps = {
  children: React.ReactNode
}

const Layout: React.FunctionComponent<LayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <>
        <ResetCss />
        <Sticky top={0} innerZ={9999} activeClass="nav-sticky">
          <Navbar />
        </Sticky>
        {children}
        <Footer>🌝초코파이 정🌚</Footer>
        <ScrollToTop
          showUnder={300}
          duration={700}
          easing="easeInOutCubic"
          style={{ bottom: 30, right: 20 }}
        >
          <ScrollUpButton />
        </ScrollToTop>
      </>
    </ThemeProvider>
  )
}

export default Layout
