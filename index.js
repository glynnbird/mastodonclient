const auth = require('./auth.js')
const axios = require('axios')

class MastodonClient {
  constructor (config) {
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
    const response = await axios.request(req)
    return response.data
  }

  async post (message, visibility, spoilerText) {
    const req = {
      method: 'post',
      url: '/api/v1/statuses',
      data: {
        status: message
      }
    }
    if (visibility) {
      req.data.visibility = visibility
    }
    if (spoilerText) {
      req.data.spoiler_text = spoilerText
    }
    return await this.request(req)
  }

  async home () {
    return await this.request({
      method: 'get',
      url: '/api/v1/timelines/home'
    })
  }
}

module.exports = {
  MastodonClient,
  auth
}
