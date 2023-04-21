const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

let token
beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('chasel', 10)
  const user = new User({ username: 'chasel', name: 'chasel', password: passwordHash })
  await user.save()
  const userForToken = {
    username: user.username,
    id: user.id,
  }
  token = jwt.sign(userForToken, process.env.SECRET)

  await Blog.deleteMany({})
  const blogObjects = helper.listWithMoreBlogs.map(blog => new Blog({ ...blog, user: user.id }))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('get function test', () => {
  test('returns the correct amount of blog posts in the JSON format', async () => {
    await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.listWithMoreBlogs.length)
  })

  test('the unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  })
})

describe('post function test', () => {
  test('making an POST request successfully creates a new blog post', async () => {
    const newBlog = {
      title: 'Test Blog',
      author: 'Chasel',
      url: 'https://testBlog.com',
      likes: 7
    }
    await api.post('/api/blogs').send(newBlog).set('Authorization', `bearer ${token}`).expect(201).expect('Content-Type', /application\/json/)
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.listWithMoreBlogs.length + 1)
  })

  test('likes property will default to the value 0', async () => {
    const newBlog = {
      title: 'Test Blog 2',
      author: 'Chasel',
      url: 'https://testBlog2.com',
    }
    await api.post('/api/blogs').send(newBlog).set('Authorization', `bearer ${token}`).expect(201).expect('Content-Type', /application\/json/)
    const response = await api.get('/api/blogs')
    expect(response.body[response.body.length - 1].likes).toBe(0)
  })

  test('responds with the status code 400 Bad if title or url properties are missing', async () => {
    const newBlog1 = {
      title: 'Test Blog 3',
      author: 'Chasel',
      likes: 7
    }
    await api.post('/api/blogs').send(newBlog1).expect(400)

    const newBlog2 = {
      title: null,
      author: 'Chasel',
      url: 'https://testBlog4.com',
      likes: 7
    }
    await api.post('/api/blogs').send(newBlog2).expect(400)
  })
})

describe('delete function test', () => {
  test('delete succeeds with status code 204 if id is valid', async () => {
    const blogToDelete = helper.listWithMoreBlogs[0]
    await api.delete(`/api/blogs/${blogToDelete._id}`).set('Authorization', `bearer ${token}`).expect(204)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.listWithMoreBlogs.length-1)
    const ids = response.body.map(result => result.id)
    expect(ids).not.toContain(blogToDelete._id)
  })
})

describe('update function test', () => {
  test('update the number of likes for a blog post', async () => {
    const blogToUpdate = helper.listWithMoreBlogs[0]
    await api.put(`/api/blogs/${blogToUpdate._id}`).send({likes: 66}).set('Authorization', `bearer ${token}`)

    const response = await api.get(`/api/blogs/${blogToUpdate._id}`)
    expect(response.body.likes).toBe(66)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})