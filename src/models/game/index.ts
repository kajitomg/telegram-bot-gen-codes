require('dotenv').config()

export enum Games {
  BIKE = 'bike',
  CUBE = 'cube',
  TRAIN = 'train',
  MERGE = 'merge',
  TWERK = 'twerk',
  POLY = 'poly',
  TRIM = 'trim',
  RACE = 'race',
  CAFE = 'cafe',
  ZOO = 'zoo',
  GANGS = 'gangs',
  ALL = 'all',
}

type Game = {
  id: Games,
  name: string,
  app_token?: string,
  promo_id?: string,
  delay?: number,
  iterations?: number,
}

export const games:Game[] = [
  {
    id: Games.CUBE,
    name: 'Chain Cube',
    app_token: process.env.APP_TOKEN_CUBE,
    promo_id: process.env.PROMO_ID_CUBE,
    delay: +process.env.EVENTS_DELAY_CUBE,
    iterations: +process.env.AMOUNT_ITTERATIONS_CUBE,
  },
  {
    id: Games.TRAIN,
    name: 'Train Miner',
    app_token: process.env.APP_TOKEN_TRAIN,
    promo_id: process.env.PROMO_ID_TRAIN,
    delay: +process.env.EVENTS_DELAY_TRAIN,
    iterations: +process.env.AMOUNT_ITTERATIONS_TRAIN,
  },
  {
    id: Games.MERGE,
    name: 'Merge Away',
    app_token: process.env.APP_TOKEN_MERGE,
    promo_id: process.env.PROMO_ID_MERGE,
    delay: +process.env.EVENTS_DELAY_MERGE,
    iterations: +process.env.AMOUNT_ITTERATIONS_MERGE,
  },
  {
    id: Games.TWERK,
    name: 'Twerk Race 3D',
    app_token: process.env.APP_TOKEN_TWERK,
    promo_id: process.env.PROMO_ID_TWERK,
    delay: +process.env.EVENTS_DELAY_TWERK,
    iterations: +process.env.AMOUNT_ITTERATIONS_TWERK,
  },
  {
    id: Games.POLY,
    name: 'Polysphere',
    app_token: process.env.APP_TOKEN_POLY,
    promo_id: process.env.PROMO_ID_POLY,
    delay: +process.env.EVENTS_DELAY_POLY,
    iterations: +process.env.AMOUNT_ITTERATIONS_POLY,
  },
  {
    id: Games.TRIM,
    name: 'Mow and Trim',
    app_token: process.env.APP_TOKEN_TRIM,
    promo_id: process.env.PROMO_ID_TRIM,
    delay: +process.env.EVENTS_DELAY_TRIM,
    iterations: +process.env.AMOUNT_ITTERATIONS_TRIM,
  },
  {
    id: Games.CAFE,
    name: 'Cafe Dash',
    app_token: process.env.APP_TOKEN_CAFE,
    promo_id: process.env.PROMO_ID_CAFE,
    delay: +process.env.EVENTS_DELAY_CAFE,
    iterations: +process.env.AMOUNT_ITTERATIONS_CAFE,
  },
  {
    id: Games.ZOO,
    name: 'Zoopolis',
    app_token: process.env.APP_TOKEN_ZOO,
    promo_id: process.env.PROMO_ID_ZOO,
    delay: +process.env.EVENTS_DELAY_ZOO,
    iterations: +process.env.AMOUNT_ITTERATIONS_ZOO,
  },
  {
    id: Games.GANGS,
    name: 'Gangs Wars',
    app_token: process.env.APP_TOKEN_GANGS,
    promo_id: process.env.PROMO_ID_GANGS,
    delay: +process.env.EVENTS_DELAY_GANGS,
    iterations: +process.env.AMOUNT_ITTERATIONS_GANGS,
  }
]

export const gamesAll: Game = {
  id: Games.ALL,
  name: 'Все игры',
}