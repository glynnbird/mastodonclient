const auth = require('./auth.js')
const axios = require('axios')

class MastodonClient {
  constructor(config) {
    this.config = config
  }

  // generic API request
  async request (opts) {
    const req = {
      method: 'get',
      baseURL: this.config.baseURL,
      headers: {
        'User-Agent': 'node-mastodonclient',
        Authorization: `Bearer ${this.config.accessToken}`
      }
    }
    Object.assign(req, opts)
    try {
      const response = await axios.request(req)
      return response.data
    } catch(e) {
      throw(e)
    }
  }

  async post (message, visibility, cw) {
    try {
      return await this.request({
        method: 'post',
        url: '/api/v1/statuses',
        data: {
          status: message,
          visibility,
          spoiler_text: cw
        }
      })
    } catch (e) {
      throw(e)
    }
  }

  async home () {
    try {
      return await this.request({
        method: 'get',
        url: '/api/v1/timelines/home'
      })
    } catch (e) {
      throw(e)
    }
  }
}

module.exports = {
  MastodonClient,
  auth
}

