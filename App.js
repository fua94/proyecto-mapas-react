import React, { Component } from 'react'
import {
    AppRegistry,
    StyleSheet,
    Text,
    View
} from 'react-native'
import LoginPage from './src/pages/Login.page'

export default class Main extends Component {
    render(){
        return(
            <LoginPage />
        )
    }
}
