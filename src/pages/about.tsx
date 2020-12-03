import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import About from "../containers/About"

type AboutPageProps = {}

const AboutPage: React.FunctionComponent<AboutPageProps> = props => {
  return (
    <Layout>
      <SEO
        title="Mash-up | 안드로이드팀 블로그"
        description="매쉬업 안드로이드 팀입니다 | 함께 배워나가며 기록을 남기고 있습니다.🌝"
      />
      <About />
    </Layout>
  )
}

export default AboutPage
