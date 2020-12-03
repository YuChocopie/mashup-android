import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout"
import PostCard from "../components/PostCard/postCard"
import SEO from "../components/seo"
import { TagPostsWrapper, TagPageHeading, TagName } from "./templates.style"

const Tags = ({ pageContext, data }: any) => {
  const { tag } = pageContext
  const { edges, totalCount } = data.allMarkdownRemark

  return (
    <Layout>
      <SEO
        title={`${tag}와 관련된 글 | 매쉬업 안드로이드 개발자 블로그`}
        description={`매쉬업 안드로이드 개발자 블로그에 ${tag}키워드로 존재하는 글은 모두 ${totalCount}개 입니다.`}
      />

      <TagPostsWrapper>
        <TagPageHeading>
          <TagName>{tag}</TagName>
          {`A collection of ${totalCount} post`}
        </TagPageHeading>
        {edges.map(({ node, index }: any) => (
          <PostCard
            key={node.fields.slug}
            title={node.frontmatter.title}
            url={node.fields.slug}
            description={node.frontmatter.description || node.excerpt}
            date={node.frontmatter.date}
            tags={node.frontmatter.tags}
          />
        ))}
      </TagPostsWrapper>
    </Layout>
  )
}

export default Tags

export const pageQuery = graphql`
  query($tag: String) {
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          excerpt(pruneLength: 300)
          fields {
            slug
          }
          frontmatter {
            date(formatString: "DD [<span>] MMMM [</span>]")
            title
            tags
            description
          }
        }
      }
    }
  }
`
