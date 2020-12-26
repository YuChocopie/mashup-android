import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
import SocialProfile from "../../components/SocialProfile/SocialProfile"
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoGithub,
} from "react-icons/io"
import {
  AboutWrapper,
  AboutImage,
  AboutPageTitle,
  AboutDetails,
  SocialProfiles,
} from "./style"
import { Desciption } from "../HomePage/Intro/style"

const SocialLinks = [
  {
    icon: <IoLogoGithub />,
    url: "https://github.com/yuchocopie/mashup-android",
    tooltip: "Github",
  },
  // {
  //   icon: <IoLogoLinkedin />,
  //   url: "https://www.linkedin.com/in/donggeun-lee-568916160/",
  //   tooltip: "Linkedin",
  // },
  {
    icon: <IoLogoInstagram />,
    url: "https://www.instagram.com/official_mashup_/",
    tooltip: "Instagram",
  },
  {
    icon: <IoLogoFacebook />,
    url: "https://www.facebook.com/mashupgroup",
    tooltip: "Facebook",
  },
]

interface AboutProps {}

const About: React.FunctionComponent<AboutProps> = props => {
  const Data = useStaticQuery(graphql`
    query {
      avatar: file(absolutePath: { regex: "/about.jpg/" }) {
        childImageSharp {
          fluid(maxWidth: 1770, quality: 90) {
            ...GatsbyImageSharpFluid
          }
        }
      }
      site {
        siteMetadata {
          author
          about
        }
      }
    }
  `)

  return (
    <AboutWrapper>
      <AboutPageTitle>
        <h2>🙌, 매쉬업 안드로이드팀 입니다 .</h2>
        <p>
          좋은 개발자가 되기 위해서는 오직 개발에만 집중하기보다는 여러 직군과
          협업을 해야 한다고 생각합니다. 개발뿐만 아니라 디자인, 기획도 하는 귀염뽀짝한 안드팀!
          <br />
          기초부터 착착 차분히 잘 다듬어가고 있어요 :)  .🌝
        </p>
      </AboutPageTitle>
      {/*<AboutImage>*/}
      {/*  <Image fluid={Data.avatar.childImageSharp.fluid} alt="author" />*/}
      {/*</AboutImage>*/}
      <AboutDetails>
        <h2 style={{ marginTop: "32px" }}>단체경력</h2>
        <div>
          <li>Mashup 개발 동아리 : (2018 ~ 현재)</li>
        
        </div>
        <SocialProfiles>
          <SocialProfile items={SocialLinks} />
        </SocialProfiles>
      </AboutDetails>
    </AboutWrapper>
  )
}

export default About
