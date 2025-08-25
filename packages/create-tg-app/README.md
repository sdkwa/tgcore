# create-tg-app

Automated tool for creating Telegram applications without a web interface. Simplifies the process of generating Telegram apps by providing a straightforward API.

## Installation

```bash
npm install @sdkwa/tgcore-create-tg-app
```

## Quick Start

### 1. Import and create client
```javascript
import { TelegramAppClient } from 'create-tg-app';

const client = new TelegramAppClient();
```

### 2. Send confirmation code
```javascript
const random_hash = await client.sendConfirmationCode('+1234567890');
```

### 3. Sign in with SMS code
```javascript
const token = await client.signIn({
  phone: '+1234567890',
  code: 'zk1bhHJ1', // SMS code received
  random_hash: random_hash // From previous step
});
```

### 4. Create Telegram app
```javascript
await client.createApp(token, {
  app_title: 'MyApp',
  app_dsc: 'My Telegram Application',
  app_url: 'https://myapp.com',
  app_platform: 'android',
  app_shortname: 'myapp'
});
```

### 5. Get app credentials
```javascript
const { apiId, apiHash } = await client.getCredentials(token);

console.log(`API ID: ${apiId}, API HASH: ${apiHash}`);
```
## License
MIT