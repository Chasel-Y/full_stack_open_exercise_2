const _ = require('lodash')

const dummy = (blogs) => {
  if(blogs.length === 0){
    return 1
  }
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if(blogs.length === 0){
    return 0
  } else {
    const favoriteBlog=blogs.reduce((acc, obj) => obj.likes > acc.likes ? obj : acc)
    return {
      title: favoriteBlog.title,
      author: favoriteBlog.author,
      likes: favoriteBlog.likes
    }
  }
}

const mostBlogs = (blogs) => {
  if(blogs.length === 0){
    return 0
  } else {
    const authorBlogsCount = _.countBy(blogs, 'author')
    const maxBlogsAuthor = _.maxBy(_.keys(authorBlogsCount), (author) => authorBlogsCount[author])
    return { author: maxBlogsAuthor, blogs: authorBlogsCount[maxBlogsAuthor]}
  }
}

const mostLikes = (blogs) => {
  if(blogs.length === 0){
    return 0
  } else {
    const authorGroup = _.groupBy(blogs, 'author')
    const authorLikes = _.mapValues(authorGroup, (authorBlogs) => _.sumBy(authorBlogs, 'likes'))
    const maxLikesAuthor = _.maxBy(_.keys(authorLikes), (author) => authorLikes[author])
    return { author: maxLikesAuthor, likes: authorLikes[maxLikesAuthor]}
  }
}

module.exports = {dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes}