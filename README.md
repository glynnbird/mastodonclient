# mastodonclient

Minimal Mastodon client for my purposes. Does the OAuth dance and allows toots to be posted, home timeline to be fetched or generic API call to be made

## Installation

```sh
npm install --save https://github.com/glynnbird/mastodonclient
```

## Usage

One time only, you need to do the OAuth dance:

```js
const mastodonclient = require('mastodonclient')
const config = await mastodonclient.auth()
```

The `config` is a JS object that contains all the details required to authenticate you to make Mastodon API calls. Stash this away in a file somewhere.

Then we can instantiate the `MastodonClient` itself from the config you created or one you reloaded the you stashed before:

```js
const mc = new mastodonclient.MastodonClient(config)
```

This can be used to post toots:

```js
// message, visibility, content warning 
await mc.post("Who's there?", 'public', 'Knock knock')
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

