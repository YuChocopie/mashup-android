import styled from 'styled-components';
import { themeGet } from 'styled-system';

const InputWrapper = styled.div`
  position: relative;
  > div {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;

    > label {
      color: ${themeGet('colors.textColor', '#292929')};
      font-size: ${themeGet('fontSizes.3', '15')}px;
      line-height: ${themeGet('lineHeights.normal', '1')};
      font-weight: ${themeGet('fontWeights.4', '500')};
    }
  }

  .notification {
    display: block;
    color: #d8000c;
    font-size: 14px;
    padding-top: 0.5em;
  }

  .inner-wrap {
    width: 100%;
    margin-top: ${themeGet('space.4', '15')}px;
    box-sizing: border-box;
    position: relative;

    &:only-child {
      margin: 0;
    }

    input,
    textarea,
    input[type='text'],
    input[type='email'],
    input[type='number'],
    input[type='password'] {
      appearance: none;
      width: 100%;
      height: ${themeGet('heights.2', '44')}px;
      border: 1px solid ${themeGet('colors.borderColor', '#DBDBDB')};
      color: ${themeGet('colors.textColor', '#292929')};
      font-size: ${themeGet('fontSizes.3', '15')}px;
      line-height: ${themeGet('lineHeights.normalText', '1.5')};
      font-weight: ${themeGet('fontWeights.3', '400')};
      padding: 0 ${themeGet('space.4', '15')}px;
      box-sizing: border-box;
      border-radius: 0;
      transition: border-color 0.25s ease;

      &:hover,
      &:focus {
        outline: 0;
      }

      &:focus {
        border-color: ${themeGet('colors.textColor', '#292929')};
      }

      &::placeholder {
        color: ${themeGet('colors.textColor', '#292929')};
      }
    }

    input[type='number'] {
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }

    textarea {
      height: auto;
      min-height: ${themeGet('heights.9', '230')}px;
      padding-top: ${themeGet('space.4', '15')}px;
      resize: none;
    }
  }

  &.disabled {
    .inner-wrap {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &.with-search-icon {
    .inner-wrap {
      position: relative;

      .search-icon {
        width: ${themeGet('widths.2', '45')}px;
        height: 100%;
        font-size: ${themeGet('fontSizes.3', '15')}px;
        color: ${themeGet('colors.textColor', '#292929')};
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;

        &.right {
          right: 0;
          left: auto;
        }
      }

      .icon-left {
        padding-left: ${themeGet('space.9', '50')}px;
      }

      .icon-right {
        padding-right: ${themeGet('space.9', '50')}px;
      }
    }
  }

  &.is-material {
    label {
      position: absolute;
      left: 15px;
      color: ${themeGet('colors.inactiveColor', '#767676')};
      font-weight: 400;
      top: 3px;
      transition: all 0.2s ease;
    }

    input,
    textarea,
    input[type='text'],
    input[type='email'],
    input[type='number'],
    input[type='password'] {
      border-radius: 0;
      border-top: 0;
      border-left: 0;
      border-right: 0;
      padding-left: 15px;
      padding-right: 15px;
      height: auto;
      background: transparent;
      border-color: ${themeGet('colors.textColor', '#292929')};
    }

    textarea {
      min-height: 40px;
      padding-bottom: 0;
    }

    .highlight {
      position: absolute;
      height: 1px;
      top: auto;
      left: 50%;
      bottom: 0;
      width: 0;
      pointer-events: none;
      transition: all 0.2s ease;
    }

    /* If input has icon then these styel */
    &.icon-left,
    &.icon-right {
      .field-wrapper {
        flex-direction: row-reverse;
        > .input-icon {
          width: auto;
        }
        > input {
          flex: 1;
        }
      }
    }

    /* When icon position in left */
    &.icon-left {
      .field-wrapper {
        > input {
          padding-left: 20px;
        }
      }
      label {
        top: -15px;
        font-size: 12px;
      }
    }

    /* When icon position in right */
    &.icon-right {
      .field-wrapper {
        > input {
          padding-right: 20px;
        }
      }
    }

    /* Material input focus style */
    &.is-focus {
      input {
        border-color: ${themeGet('colors.inactiveIcon', '#ebebeb')};
      }

      label {
        top: -10px;
        font-size: 12px;
        color: ${themeGet('colors.textColor', '#484848')};
      }

      .highlight {
        width: 100%;
        height: 2px;
        left: 0;
      }
    }
  }
`;

export default InputWrapper;
