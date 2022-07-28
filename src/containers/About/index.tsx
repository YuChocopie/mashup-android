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
  AboutMember,
  AboutProject,
  AboutStudy
} from "./style"
import { Desciption } from "../HomePage/Intro/style"
import { textAlign, textStyle } from "styled-system"

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
        <AboutStudy>
          <h2>안드로이드 팀</h2>
          <p>
            <img src={require('../../images/study/1.jpg')} alt ="그땐_몰랐지_이게_마지막일_줄.jpg"/> 
            <img src={require("../../images/study/2.jpg")} alt="만나고_싶다_신입_기수.jpg"/> 
            <img src={require("../../images/study/3.jpg")} alt="이땐_몰랐다_오프라인의_소중함.jpg"/> 
            <img src={require("../../images/study/4.jpg")} alt="오프라인_스터디_하고_싶어요.jpg"/>
            <img src={require("../../images/study/6.jpg")} alt="그래도_즐거운_온라인_스터디.jpg"/> 
            <img src={require("../../images/study/7.jpg")} alt="웃어요_웃어봐요.jpg"/> 
            <img src={require("../../images/study/5.jpg")} alt="실습도_문제_없지.jpg"/> 
            <img src={require("../../images/study/8.jpg")} alt="사다리_타기도_개발자답게.jpg"/>
          </p>
          <p>
            🥰 <u><strong>귀염 뽀짝 슈퍼 러블리</strong></u> 매셥 안드로이드 팀은 즐겁게 공부하고 열심히 노는 것을 목표로 순항 중(~ing)
          </p>
          <p>
            #친목 #술 #오프라인_지향 #코로나_한정_랜선_모임
            #매주_토요일_즐거운_스터디 #친구와_함께라면_외롭지_않아🐠
            #android_architecture #kotlin #effective_java #coroutine #rxjava #dagger2 #hilt</p>
          <p>&nbsp;</p> 
        </AboutStudy>
      </AboutPageTitle>
      {/*<AboutImage>*/}
      {/*  <Image fluid={Data.avatar.childImageSharp.fluid} alt="author" />*/}
      {/*</AboutImage>*/}
      <AboutDetails>
        <h2 style={{ marginTop: "32px"}}><b>단체경력</b></h2>
        <div>
          <li>Mashup 개발 동아리 : (2018 ~ 현재)</li>
        </div>

        <AboutProject>
          <h2 style={{ marginTop: "32px"}}><b>진행 프로젝트</b></h2>
          <table>
            <tbody>
            <tr>
            <td><a href="https://github.com/mash-up-kr/Potato-Invitation-Android" target="_blank"><img src = {require("../../images/project/logo_nawa.png")}/></a><br/>감자와 아이들팀<br/>(간편 초대장 제작 서비스)</td>
            <td><a href="https://github.com/mash-up-kr/Dionysos-Android" target="_blank"><img src = {require("../../images/project/logo_dionysos.png")}/></a><br/>디오니소스팀<br/>(모여서 각자 공부 서비스)</td>
            </tr>
            <tr>
            <td><a href="https://github.com/mash-up-kr/Tich-Android" target="_blank"><img src = {require("../../images/project/logo_티치.png")}/></a><br/>면블리팀<br/>(생활용품 교체주기알림)</td>
            <td><a href="https://github.com/mash-up-kr/Four-Ten-Android" target="_blank"><img src = {require("../../images/project/logo_jado.png")}/></a><br/>포텐팀<br/>(습관 만들기 어플)</td>
            </tr>
            </tbody>
          </table> 
        </AboutProject>

        <AboutMember>
        <h2 style={{ marginTop: "32px"}}><b>People</b></h2>
        <div style = {{alignItems : ""}}>
          <div className = "member-row">
            <img src = { require('../../images/member/강다현.jpeg')} />
            <p>
            <a href="https://github.com/dahyun1226">강다현</a><br/>
            안드로이드 9기<br/>
            한줄 소개 : 2021년의 라이징 스타
            </p>
          </div>
          <div className = "member-row">
            <img src = { require('../../images/member/김유정.jpeg')}/> 
            <p>
            <a href="https://github.com/yuchocopie">김유정</a><br/>
            안드로이드 6기<br/>
            한줄 소개 : 안드팀의 친목담당 유초코입니다~~
            </p>
          </div>
          <div className = "member-row">
            <img src = { require('../../images/member/박지영.jpeg')}/>
            <p>
            <a href="https://github.com/d2fault">박지영</a><br/>
            안드로이드 9기<br/>
            한줄 소개 : 2021년의 라이징 스타
            </p>
          </div>
          <div className = "member-row">
            <img src = { require('https://avatars.githubusercontent.com/u/33657541?v=4')}/>
            <p>
            <a href="https://github.com/jaeryo2357">양민욱</a><br/>
            안드로이드 10기~<br/>
            한줄 소개 : 안드팀 10기 열정 담당
            </p>
          </div>
          <div className = "member-row">
            <img src = { require('../../images/member/유희진.jpeg')}/>
            <p>
            <a href="https://github.com/Huijiny">유희진</a><br/>
            안드로이드 10기<br/>
            한줄 소개 : 안녕하세요! 안둥이 유희진입니다! 많이 듣고 배우겠습니다🙇‍♀️
            </p>
          </div>
        </div>
        </AboutMember>
        
        <SocialProfiles>
          <SocialProfile items={SocialLinks} />
        </SocialProfiles>
        
      </AboutDetails>
    </AboutWrapper>
  )
}

export default About
