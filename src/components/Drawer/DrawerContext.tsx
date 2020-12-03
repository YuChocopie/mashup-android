import React, { useReducer } from 'react';

const initialState = {
  isOpen: false,
};

function reducer(state: any, action: any) {
  switch (action.type) {
    case 'TOGGLE':
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    default:
      return state;
  }
}
export const DrawerContext = React.createContext({});

type DrawerProviderProps = {
  children: any;
};

export const DrawerProvider: React.FunctionComponent<DrawerProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <DrawerContext.Provider value={{ state, dispatch }}>
      {children}
    </DrawerContext.Provider>
  );
};
