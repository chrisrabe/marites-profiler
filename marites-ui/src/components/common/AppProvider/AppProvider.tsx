import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import store from "redux/store";

interface AppProviderProps {
  children?: ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => (
  <Provider store={store}>{children}</Provider>
);

export default AppProvider;
