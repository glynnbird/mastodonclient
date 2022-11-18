const readline = require('readline');
const HOST = 'mastodon.social'
const REDIRECT_URL = 'urn:ietf:wg:oauth:2.0:oob'
const SCOPE = 'read write follow'
const OAuth2 = require('oauth').OAuth2 
const axios = require('axios')

const createOAuthApp = async (apiurl) => {
  const req = {
    method: 'post',
    baseURL: apiurl,
    url: '/api/v1/apps',
    data: {
      client_name: `toot-${new Date().toISOString().substr(0,10)}`,
      website: null,
      redirect_uris: REDIRECT_URL,
      scopes: SCOPE
    }
  }
  console.log('Creating Mastodon app...')
  const response = await axios.request(req)
  return response.data
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


const question = async (q, def) => {
  if (def) {
    q = q + ` (${def})`
  }
  q += ': '
  return new Promise((resolve, reject) => {
    rl.question(q, (r) => {
      resolve(r)
    })
  })
}

const auth = async function () {
  const rl = readline.createInterface(process.stdin, process.stdout);
  const host = await question('Mastodon host', HOST) || HOST
  const url = `https://${host}`
  const apiurl = `${url}/api/v1`
  const app = await createOAuthApp(url)
  const oauth = new OAuth2(app.client_id, app.client_secret, url, null, '/oauth/token')
  const authURL = await getAuthorizationUrl(app, oauth)
  console.log('This is the authorization URL. Open it in your browser and authorize with your account')
  console.log('  ', authURL)         
  const code = await question('Please enter the code from the website') 
  const accessToken = await getAccessToken(oauth, code)
  rl.close()
  app.accessToken = accessToken
  app.baseURL = url
  return app
}