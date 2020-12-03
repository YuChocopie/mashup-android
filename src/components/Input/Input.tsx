import React from 'react';
import InputWrapper from './Input.style';

type InputProps = {
  id?: any;
  type?: string;
  disabled?: boolean;
  label?: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  className?: string;
  secondaryComponent?: React.ReactChild | React.ReactChildren; // this prop only for number field
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  onFocus?: (e: any) => void;
  notification?: string;
  required?: boolean;
  ariaLabel?: string;
};

const Input: React.FC<InputProps> = ({
  type,
  label,
  style,
  disabled,
  className,
  secondaryComponent,
  containerStyle,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  notification,
  required,
  ariaLabel,
  ...props
}) => {
  // Add all classs to an array
  const addAllClasses: string[] = ['field-wrapper'];

  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  // Add disabled class
  if (disabled) {
    addAllClasses.push('disabled');
  }

  // Init variable for Label For and Input element
  let htmlFor, inputElement;

  // Make Label value to htmlFor
  if (label) {
    htmlFor = label.replace(/\s+/g, '_').toLowerCase();
  }

  // Label Field
  const labelField = label && <label htmlFor={htmlFor}>{label}</label>;
  const notificationMessage = notification && (
    <div className="notification">{notification}</div>
  );

  // Set Input element based on type prop
  switch (type) {
    case 'textarea':
      inputElement = (
        <div className="inner-wrap">
          <textarea
            id={htmlFor}
            name={name}
            disabled={disabled}
            style={style}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            required={required}
            aria-label={name || ariaLabel}
            {...props}
          />
        </div>
      );
      break;

    default:
      inputElement = (
        <div className="inner-wrap">
          <input
            type={type}
            id={htmlFor}
            disabled={disabled}
            style={style}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            required={required}
            aria-label={name || ariaLabel}
            {...props}
          />
        </div>
      );
      break;
  }

  return (
    <InputWrapper
      className={`${addAllClasses.join(' ')}`}
      style={containerStyle}
    >
      {labelField || secondaryComponent ? (
        <div>
          {labelField} {secondaryComponent}
        </div>
      ) : (
        ''
      )}
      {inputElement}
      {notificationMessage}
    </InputWrapper>
  );
};

export default Input;
