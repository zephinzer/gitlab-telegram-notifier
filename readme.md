# Usage

Clone repostiory and install dependencies with `yarn install`. Or `npm install`.

Create a `.env` file with the following values in the project root:

```
DEFAULT_ENVIRONMENT=default_environment
DEFAULT_LOCALE=en
DEFAULT_VICTIM=default_name
TELEGRAM_CHAT_ID=<your telegram chat id>
TELEGRAM_BOT_TOKEN=<your telegram bot token *required>
PORT_SERVER=3301
```

To find out the telegram chat ID, add your bot to your group with `TELEGRAM_BOT_TOKEN`
set and use `/info` to retrieve the chat ID.

## Chat Commands
The following commands can be called to trigger checks:

`/help`
- returns a list of usable commands

`/info`
- returns chat info

`/status` :environment
- checks the status for the specified :environment

`/system`
- returns system information where application is running

## Server Webhooks

### POSTS
Use these to set states.

The following endpoints can be called to trigger messages:

`POST /build/succeeded`

`POST /build/failed`

`POST /deploy/succeeded`

`POST /deploy/failed`

`POST /test/succeeded`

`POST /test/failed`

Universal POST parameters:

`commid_id` : ID of the commit

`victim` : who should be named

`environment` : the environment where the build succeeded

Universal POST response: `'ok'`

### GETS
Use these to get states.

The following endpoints can be called to get JSON responses:

`GET /build/status`

`GET /deploy/status`

`GET /test/status`

Universal GET parameters:

`environment` : environment to check

Universal GET response: `{ true, false, null }`

`true` is returned when status is happy

`false` is returned when status is sad

`null` is returned when status could not be found
