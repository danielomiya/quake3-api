# Quake3-API

This project aims to make available results from Quake III plays as a RESTful API.

## Built with

- Node (v10.10.0)
- NPM (6.4.1)
- SQLite3

## How to get it running

- Clone it
  `git clone https://github.com/gwyddie/quake3-api`
- Get into the folder
  `cd quake3-api`
- Install the dependencies
  `npm i`
- Set defaults on your `.env` file (you can just rename `defaults.env` to `.env`)
  `mv defaults.env .env`
- Create the database
  `npm run create-db`
- Seed it
  `npm run seed-db`
- Then run it
  `npm run start`

And now you can see it on <http://localhost:3000/api/games/21>.

## Example of use

This app has a single route, `/api/games/:id`, where `:id` is a numeric identifier of the game match.

That's all, folks!

Thank you
