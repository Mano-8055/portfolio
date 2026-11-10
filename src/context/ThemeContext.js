import { createContext } from "react";

const ThemeContext = createContext({ theme: "dark", toggle: () => {} });

export default ThemeContext;