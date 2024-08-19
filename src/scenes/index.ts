import broadcast from './broadcast';
import codes from './codes';

export default [
  ...Object.values(broadcast).map(scene => scene()),
  ...Object.values(codes).map(scene => scene())
]