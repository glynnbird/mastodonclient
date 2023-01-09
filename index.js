const auth = require('./auth.js')
const undici = require('undici')

class MastodonClient {
  constructor (config) {
    this.config = config
  }

  // generic API request
  async request (opts) {
    const req = {
      method: 'get',
      headers: {
        'User-Agent': 'node-mastodonclient',
        Authorization: `Bearer ${this.config.accessToken}`,
        'content-type': 'application/json'
      }
    }
    Object.assign(req, opts)
    if (req.body) {
      req.body = JSON.stringify(req.body)
    }
    const url = this.config.baseURL + opts.url
    delete req.url
    const response = await undici.fetch(url, req)
    return response.json()
  }

  async post (message, visibility, spoilerText) {
    const req = {
      method: 'post',
      url: '/api/v1/statuses',
      body: {
        status: message
      }
    }
    if (visibility) {
      req.body.visibility = visibility
    }
    if (spoilerText) {
      req.body.spoiler_text = spoilerText
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
