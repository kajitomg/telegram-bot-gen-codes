import broadcast from './broadcast';

export default [
  ...Object.values(broadcast).map(scene => scene())
]