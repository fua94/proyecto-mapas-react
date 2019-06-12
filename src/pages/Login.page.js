import React, { Component } from 'react'
import {
    StyleSheet,
    View,
    Image,
    Text,
    KeyboardAvoidingView,
    TouchableOpacity,
    StatusBar,
    TextInput,
    CheckBox,
    Alert
} from 'react-native'

import { createStackNavigator, createAppContainer } from 'react-navigation'

import axios from 'axios'

import SplashPage from './Splash.page'
import MapClient from './MapClient.page'

const placeholderTextColor = '#bdc3c7'

const BASE_URL = 'http://puceing.edu.ec:15005/FranciscoUlloa/mapas/api/usuarios'

class LoginPage extends Component {

    static navigationOptions = {
        header: null
    }

    state = {
        isDriver: false,
        user: '',
        pass: ''
    }

    login = () => {
        const usuario = this.state.user
        const password = this.state.pass

        if(usuario !== '' && password !== ''){

            const credenciales = {
                USUARIO: this.state.user,
                PASSWORD: this.state.pass
            }

            axios.put(BASE_URL, credenciales).then(response => {

                if(response.data != null){
                    this.props.navigation.navigate('MapClient')
                }else{
                    alert('Usuario no encontrado o contraseña incorecta...')
                }

            }).catch(error => {
                alert('Error de conexión')
            })
        }
        else{
            alert('Los campos no deben estar vacíos!')
        }
    }

    register = () => {
        const usuario = this.state.user
        const password = this.state.pass

        if(usuario !== '' && password !== ''){
            Alert.alert(
                'Mensaje',
                '¿Desea registrar el usuario?',[
                    {
                        text: 'Cancel',
                        onPress: () => { return },
                        style: 'cancel',
                    },
                    {
                        text: 'OK',
                        onPress: () => {

                            const credenciales = {
                                USUARIO: this.state.user,
                                PASSWORD: this.state.pass
                            }

                            axios.post(BASE_URL, credenciales).then(response => {

                                if(response.data != null){
                                    this.props.navigation.navigate('MapClient')
                                }else{
                                    alert('Error registrando el usuario')
                                }

                            }).catch(error => {
                                alert('Error de conexión')
                            })
                        }
                    }
                ],
                {
                    cancelable: false
                }
            )
        }
        else{
            alert('Los campos no deben estar vacíos!')
        }

    }

    render(){
        return(
            <KeyboardAvoidingView behavior="padding" style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image style={styles.logo}
                        source={require('../../assets/taxi-icon.png')} />
                    <Text style={styles.title}>Una aplicación hecha para ti!</Text>
                </View>
                <View style={styles.formContainer}>
                    <StatusBar barStyle='light-content' />
                    <TextInput style={styles.input}
                        placeholder='Usuario'
                        placeholderTextColor={placeholderTextColor}
                        onSubmitEditing={() => this.passwordInput.focus()}
                        onChangeText={(user) => this.setState({user})}
                        value={this.state.user}
                        autoCapitalize='none'
                        returnKeyType='next'/>
                    <TextInput style={styles.input}
                        placeholder='Contraseña'
                        secureTextEntry
                        returnKeyType='go'
                        placeholderTextColor={placeholderTextColor}
                        ref={(input) => this.passwordInput = input}
                        onChangeText={(pass) => this.setState({pass})}
                        autoCapitalize='none'
                        value={this.state.pass}/>
                    <View style={styles.checkBox}>
                        <CheckBox
                        value={this.state.isDriver}
                        onValueChange={() => this.setState({ isDriver: !this.state.isDriver })}/>
                        <Text style={styles.checkBoxText}>Ingresar como conductor</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button}
                            onPress={this.login}>
                            <Text style={styles.buttonText}>Ingresar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button}
                            onPress={this.register}>
                            <Text style={styles.buttonText}>Registrarme</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2ecc71'
    },
    logoContainer: {
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'center',
        marginTop: 30
    },
    logo: {
        tintColor: '#27ae60'
    },
    title: {
        color: 'white',
        marginTop: 10,
        width: 140,
        textAlign: 'center',
        opacity: 8.9
    },
    formContainer: {
        padding: 20
    },
    input: {
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.7)',
        marginBottom: 20,
        color: '#2c3e50',
        paddingHorizontal: 10
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    button: {
        backgroundColor: '#27ae60',
        padding: 15,
        width: '47%'
    },
    buttonText: {
        textAlign: 'center',
        color: '#FFF',
        fontWeight: '700'
    },
    checkBox: {
        flexDirection: 'row',
        marginBottom: 20,
        height: 40,
        alignItems: 'center'
    },
    checkBoxText:{
        color: '#FFF',
        paddingBottom: 3,
        fontWeight: 'bold'
    }
})

const AppNavigator = createStackNavigator(
    {
        LoginPage,
        SplashPage,
        MapClient
    },
    {
        initialRouteName: 'LoginPage'
    }
)

export default createAppContainer(AppNavigator)
