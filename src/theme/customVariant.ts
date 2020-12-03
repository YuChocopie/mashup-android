import { variant } from 'styled-system';

const buttonStyle = variant({
  key: 'buttonStyles',
});

const colorStyle = variant({
  key: 'colorStyles',
  prop: 'colors',
});

const buttonSize = variant({
  key: 'buttonSize',
  prop: 'size',
});

export { buttonStyle, colorStyle, buttonSize };
