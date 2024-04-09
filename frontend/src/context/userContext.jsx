import { createContext, useContext, useReducer } from "react";

const getUserFromLocalStorage = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Failed to load user from local storage:', error);
    return null;
  }
};

const initialState = {
    user: getUserFromLocalStorage()
};

const actionTypes = {
    SET_USER: 'SET_USER',
    LOGOUT: 'LOGOUT'
}

const userReducer = (state, action) => {
    switch (action.type) {
        case actionTypes.SET_USER:
            return {
                user: action.payload
            };
        case actionTypes.LOGOUT:
            return {
                user: null
            };
        default:
            return state
    }
}

const UserContext = createContext({
    user: null,
    setUser: () => {},
    logout: () => {}
});

export const UserContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, initialState);

    const setUser = (userData) => {
        dispatch({ type: actionTypes.SET_USER, payload: userData });
        localStorage.setItem('user', JSON.stringify(userData));
    }

    const logout = () => {
        dispatch({ type: actionTypes.LOGOUT });
        localStorage.removeItem('user');
    }

    return (
        <UserContext.Provider value={{ user: state.user, setUser, logout }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext);