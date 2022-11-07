import React, { createContext, useEffect, useState } from "react";
import { useHistory } from 'react-router-dom'
import api from './auth-request-api'
import jsTPS from '../common/jsTPS'



const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);
const tps = new jsTPS();

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
    GET_LOGGED_IN: "GET_LOGGED_IN",
    LOGIN_USER: "LOGIN_USER",
    LOGOUT_USER: "LOGOUT_USER",
    REGISTER_USER: "REGISTER_USER",
    USER_EXISTS: "USER_EXISTS",
    WRONG_I: "WRONG_I",
    MISSING_INFO: "MISSING_INFO",
    PASSWORD_NO_MATCH: "PASSWORD_NO_MATCH",
    PASSWORD_SHORT: "PASSWORD_SHORT",
    HIDE_MODALS: "HIDE_MODALS"
    
}

const CurrentModal = {
    NONE : "NONE",
    ACCOUNT_EXISTS: "ACCOUNT_EXISTS",
    WRONG_INFO: "WRONG_INFO",
    MISSING_INFO: "MISSING_INFO",
    PASSWORD_NO_MATCH: "PASSWORD_NO_MATCH",
    PASSWORD_SHORT: "PASSWORD_SHORT"
}


function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        CurrentModal: CurrentModal.NONE,
        user: null,
        loggedIn: false,
        email: null,
        password: null,
        passwordVerify: null, 
        fName: null,
        lName: null
    });
    const history = useHistory();

    useEffect(() => {
        auth.getLoggedIn();
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn
                });
            }
            case AuthActionType.LOGIN_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true
                })
            }
            case AuthActionType.LOGOUT_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    email: null,
                    password: null
                })
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true,
                    email: payload.email,
                    password: payload.password,
                    passwordVerify: payload.passwordVerify,
                    fName: payload.fName,
                    lName: payload.lName
                })
            }
            case AuthActionType.USER_EXISTS: {
                return setAuth({
                    CurrentModal: CurrentModal.ACCOUNT_EXISTS,
                    user: payload.user,
                    email: payload.email,
                    loggedIn: false
                })
            }
            case AuthActionType.WRONG_I: {
                return setAuth({
                    CurrentModal: CurrentModal.WRONG_INFO,
                    user: payload.user,
                    email: payload.email,
                    password: payload.password,
                    passwordVerify: payload.passwordVerify,
                    fName: payload.fName,
                    lName: payload.lName,
                    loggedIn: false
                })
            }
            case AuthActionType.MISSING_INFO: {
                return setAuth({
                    CurrentModal: CurrentModal.MISSING_INFO,
                    user: payload.user,
                    email: payload.email,
                    password: payload.password,
                    passwordVerify: payload.passwordVerify,
                    fName: payload.fName,
                    lName: payload.lName,
                    loggedIn: false
                })
            }
            case AuthActionType.PASSWORD_NO_MATCH: {
                return setAuth({
                    CurrentModal: CurrentModal.PASSWORD_NO_MATCH,
                    password: payload.password,
                    passwordVerify: payload.passwordVerify,
                    loggedIn: false
                })
            }
            case AuthActionType.PASSWORD_SHORT: {
                return setAuth({
                    CurrentModal: CurrentModal.PASSWORD_SHORT,
                    password: payload.password,
                    passwordVerify: payload.passwordVerify,
                    loggedIn: false
                })
            }
            case AuthActionType.HIDE_MODALS: {
                return setAuth({
                    CurrentModal: CurrentModal.NONE,
                    user: null,
                    email: null,
                    password: null,
                    passwordVerify: null,
                    fName: null,
                    lName: null,
                    loggedIn: false
                })
            }
            default:
                return auth;
        }
    }

    auth.getLoggedIn = async function () {
        const response = await api.getLoggedIn();
        if (response.status === 200) {
            authReducer({
                type: AuthActionType.SET_LOGGED_IN,
                payload: {
                    loggedIn: response.data.loggedIn,
                    user: response.data.user
                }
            });
        }
    }

    auth.registerUser = async function(firstName, lastName, email, password, passwordVerify) {
        try{
            const response = await api.registerUser(firstName, lastName, email, password, passwordVerify);      
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.REGISTER_USER,
                    payload: {
                        user: response.data.user
                    }
                })
                history.push("/");
            }
        } catch(error){
            console.log(error.response.data.errorMessage);
            auth.pickRegisterModal(firstName, lastName, email, password, passwordVerify);

        }
    }

    auth.loginUser = async function(email, password) {
        try{
            const response = await api.loginUser(email, password);
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.LOGIN_USER,
                    payload: {
                        user: response.data.user
                    }
                })
                history.push("/");
            }
        } catch(error){
            console.log(error.response.data.errorMessage);
            auth.showIncorrectLogin(email, password)
        }
    }

    auth.logoutUser = async function() {
        const response = await api.logoutUser();
        if (response.status === 200) {
            authReducer( {
                type: AuthActionType.LOGOUT_USER,
                payload: null
            })
            history.push("/");
            tps.clearAllTransactions();
        }
    }

    auth.getUserInitials = function() {
        let initials = "";
        if (auth.user) {
            initials += auth.user.firstName.charAt(0);
            initials += auth.user.lastName.charAt(0);
        }
        console.log("user initials: " + initials);
        return initials;
    }
    auth.eraseTransactions = function() {
        tps.clearAllTransactions();
    }
    auth.showUserExistsModal = (e) => {
        authReducer( {
            type: AuthActionType.USER_EXISTS,
            payload: {
                email: e
            }
        })
    }
    auth.isUserExistsModalOpen = () => {
        return auth.CurrentModal === CurrentModal.ACCOUNT_EXISTS;
    }
    auth.showIncorrectLogin = (e, p) => {
        authReducer( {
            type: AuthActionType.WRONG_I,
            payload: {
                email: e,
                password: p
            }
        })
    }
    auth.isIncorrectLoginOpen = () => {
        return auth.CurrentModal === CurrentModal.WRONG_INFO;
    }
    auth.closeModals = function(){
        authReducer( {
            type: AuthActionType.HIDE_MODALS,
            payload: {}
        })
    }
    auth.showMissingInfo = (f, l ,e,p, py) =>{
        authReducer({
            type: AuthActionType.MISSING_INFO,
            payload: {
                fName: f,
                lName: l,
                email: e,
                password: p,
                passwordVerify: py
            }
        })
    }
    auth.isMissingInfoOpen = () => {
        return auth.CurrentModal === CurrentModal.MISSING_INFO;
    }

    auth.showPasswordNoMatchModal = (p, py) => {
        authReducer({
            type: AuthActionType.PASSWORD_NO_MATCH,
            payload: {
                password: p,
                passwordVerify: py
            }
        })
    }
    auth.isPasswordNoMatchOpen = () => {
        return auth.currentModal === CurrentModal.PASSWORD_NO_MATCH;
    }
    auth.showPasswordLengthBad = (p) => {
        authReducer({
            type: AuthActionType.PASSWORD_SHORT,
            payload: {
                password: p
            }
        })
    }
    auth.isPasswordLengthOpen = () => {
        return auth.currentModal === CurrentModal.PASSWORD_SHORT;
    }
    auth.eraseTransactions = function() {
        tps.clearAllTransactions();
    }
    auth.pickRegisterModal = (firstName, lastName, email, password, passwordVerify) => {
        if (firstName === null || lastName === null || email === null || password === null || passwordVerify === null){
            auth.showMissingInfo(firstName, lastName, email, password, passwordVerify);
        }
        else if (password !== passwordVerify){
            auth.showPasswordNoMatchModal(password, passwordVerify);
        }
        else if (password.length < 8){
            auth.showPasswordLengthBad(password);
        }
        else{
            auth.showUserExistsModal(email);
        }   
    }
    return (
        <AuthContext.Provider value={{
            auth
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };