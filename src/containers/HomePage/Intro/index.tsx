import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
import SocialProfile from "../../../components/SocialProfile/SocialProfile"
import {
  IntroWrapper,
  IntroImage,
  IntroTitle,
  Desciption,
  IntroInfo,
} from "./style"
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoGithub,
  IoLogoLinkedin,
} from "react-icons/io"

type IntroProps = {}

const SocialLinks = [
  {
    icon: <IoLogoGithub />,
    url: "https://github.com/yuchocopie/mashup-android",
    tooltip: "Github",
  },
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

const Intro: React.FunctionComponent<IntroProps> = () => {
  const Data = useStaticQuery(graphql`
    query {
      avatar: file(absolutePath: { regex: "/author.png/" }) {
        childImageSharp {
          fluid(maxWidth: 210, maxHeight: 210, quality: 100) {
            ...GatsbyImageSharpFluid_withWebp_tracedSVG
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

  const { author } = Data.site.siteMetadata
  const AuthorImage = Data.avatar.childImageSharp.fluid

  return (
    <IntroWrapper>
      <IntroImage>
        <Image fluid={AuthorImage} alt="author" />
      </IntroImage>
      <IntroInfo>
        
        <IntroTitle>
          안녕하세요 🙌 <b>{author}</b>입니다.
        </IntroTitle>
        <Desciption>
          좋은 개발자가 되기 위해서는 오직 개발에만 집중하기보다는 여러 직군과
          협업을 해야 한다고 생각합니다. 개발뿐만 아니라 디자인, 기획도 하는 귀염뽀짝한 안드팀!
          <br />
          기초부터 착착 차분히 잘 다듬어가고 있어요 :)  .🌝
        </Desciption>
        <SocialProfile items={SocialLinks} />
      </IntroInfo>
    </IntroWrapper>
  )
}

export default Intro
