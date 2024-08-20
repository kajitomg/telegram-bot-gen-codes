require('dotenv').config()

export enum Games {
  BIKE = 'bike',
  CUBE = 'cube',
  CLONE = 'clone',
  TRAIN = 'train',
  MERGE = 'merge',
  TWERK = 'twerk',
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
    id: Games.BIKE,
    name: 'Riding Extreme 3D',
    app_token: process.env.APP_TOKEN_BIKE,
    promo_id: process.env.PROMO_ID_BIKE,
    delay: +process.env.EVENTS_DELAY_BIKE,
    iterations: +process.env.AMOUNT_ITTERATIONS_BIKE,
  },
  {
    id: Games.CUBE,
    name: 'Chain Cube',
    app_token: process.env.APP_TOKEN_CUBE,
    promo_id: process.env.PROMO_ID_CUBE,
    delay: +process.env.EVENTS_DELAY_CUBE,
    iterations: +process.env.AMOUNT_ITTERATIONS_CUBE,
  },
  {
    id: Games.CLONE,
    name: 'My Clone Army',
    app_token: process.env.APP_TOKEN_CLONE,
    promo_id: process.env.PROMO_ID_CLONE,
    delay: +process.env.EVENTS_DELAY_CLONE,
    iterations: +process.env.AMOUNT_ITTERATIONS_CLONE,
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
    iterations:+ process.env.AMOUNT_ITTERATIONS_TWERK,
  }
]

export const gamesAll: Game = {
  id: Games.ALL,
  name: 'Все игры',
}