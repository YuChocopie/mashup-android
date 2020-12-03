import React from "react"
import { graphql } from "gatsby"
import Navbar from "../components/Navbar/Navbar"
import ResetCss from "../components/resetCSS"
import SEO from "../components/seo"
import NotFound from "../containers/NotFound"
import Footer from "../components/Footer/Footer"

const NotFoundPage = (props: any) => {
  return (
    <>
      <ResetCss />
      <Navbar />
      <SEO title="404: Not Found" />
      <NotFound />
    </>
  )
}

export default NotFoundPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
