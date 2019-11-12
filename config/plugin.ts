import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  // static: true,
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },

  validate: {
    enable: true,
    package: 'egg-validate',
  },

  cors: {
    enable: true,
    package: 'egg-cors',
  },
};

export default plugin;
