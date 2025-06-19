# mastodonclient

Minimal Mastodon client for my purposes. Does the OAuth dance and allows toots to be posted, home timeline to be fetched or generic API call to be made

## Installation

```sh
npm install --save mastodonclient
```

## Usage

One time only, you need to do the OAuth dance. This is an interactive process where you'll need to enter your Mastodon hostname, visit a URL and enter the code displayed at that URL back into the command line prompt.

```js
import * as mastonclient from 'mastodonclient'
const config = await mastonclient.auth()
console.log(config)
```

The `config` is a JS object that contains all the details required to authenticate you to make Mastodon API calls. Stash this away in a file somewhere.

If we have a `config` object we can instantiate the `MastodonClient` itself:

```js
const mc = new mastonclient.MastodonClient(config)
```

This can be used to post toots:

```js
// message, visibility, content warning 
await mc.post('Who\'s there?', 'public', 'Knock knock')
```

fetch your timeline:

```js
const timeline = await mc.home()
```

or do any other request:

```js
const result = await mc.request({
  method: 'get',
  url: '/api/v1/timelines/home',
  params: {
    limit: 5
  }
})
```

See the [Mastodon API reference](https://docs.joinmastodon.org/methods/statuses/).

