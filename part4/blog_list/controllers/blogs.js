require('express-async-errors')
const middleware = require('../utils/middleware')

const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async(request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async(request, response) => {
  const body = request.body
  if (body.title === null || body.url === null || body.title === undefined || body.url === undefined) {
    response.status(400).json({error: 'title or url missing'})
  } else {
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes===null||body.likes===''? 0 : body.likes,
      user:request.user.id,
    })
    const savedBlog = await blog.save()
    request.user.blogs = request.user.blogs.concat(savedBlog._id)
    await request.user.save()
    response.status(201).json(savedBlog)
  }
})

blogsRouter.get('/:id', async(request, response) => {
  const blog = await Blog.findById(request.params.id)
  if(blog){
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', middleware.userExtractor, async(request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog.user.toString() === request.user.id.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } else {
    response.status(401).json({ error: 'permission denied' })
  }
})

blogsRouter.put('/:id', async(request, response) => {
  const { title, author, url, likes} = request.body
  const updatedBlog ={
    title, author, url, likes
  }
  await Blog.findByIdAndUpdate(request.params.id, updatedBlog, { new: true, runValidators: true, context: 'query' })
  response.json(updatedBlog)
})

module.exports = blogsRouter