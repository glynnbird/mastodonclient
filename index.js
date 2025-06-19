
import readline from 'node:readline/promises'
import { OAuth2 } from 'oauth'

const HOST = 'mastodon.social'
const REDIRECT_URL = 'urn:ietf:wg:oauth:2.0:oob'
const SCOPE = 'read write follow'

const createOAuthApp = async (apiurl) => {
  const req = {
    method: 'post',
    body: JSON.stringify({
      client_name: `toot-${new Date().toISOString().substring(0, 10)}`,
      website: null,
      redirect_uris: REDIRECT_URL,
      scopes: SCOPE
    }),
    headers: {
      'content-type': 'application/json'
    }
  }
  console.log('Creating Mastodon app...')
  const response = await fetch(apiurl + '/api/v1/apps', req)
  return await response.json()
}

const getAuthorizationUrl = async (app, oauth) => {
  return new Promise((resolve, reject) => {
    const url = oauth.getAuthorizeUrl({
      redirect_uri: REDIRECT_URL,
      response_type: 'code',
      client_id: app.client_id,
      scope: SCOPE
    })
    resolve(url)
  })
}

const getAccessToken = async (oauth, code) => {
  return new Promise((resolve, reject) => {
    console.log('Getting access token...')
    oauth.getOAuthAccessToken(code, {
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URL
    }, (err, accessToken /* , refreshToken, res */) => {
      if (err) {
        reject(err)
        return
      }
      resolve(accessToken)
    })
  })
}

const question = async (rl, q, def) => {
  if (def) {
    q = q + ` (${def})`
  }
  q += ': '
  return rl.question(q)
  // return new Promise((resolve, reject) => {
  //   rl.question(q, (r) => {
  //     resolve(r)
  //   })
  // })
}

export async function auth () {
  const rl = readline.createInterface(process.stdin, process.stdout)
  const host = await question(rl, 'Mastodon host', HOST) || HOST
  const url = `https://${host}`
  const app = await createOAuthApp(url)
  const oauth = new OAuth2(app.client_id, app.client_secret, url, null, '/oauth/token')
  const authURL = await getAuthorizationUrl(app, oauth)
  console.log('This is the authorization URL. Open it in your browser and authorize with your account')
  console.log('  ', authURL)
  const code = await question(rl, 'Please enter the code from the website')
  const accessToken = await getAccessToken(oauth, code)
  rl.close()
  app.accessToken = accessToken
  app.baseURL = url
  return app
}

export class MastodonClient {
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
    const response = await fetch(url, req)
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
