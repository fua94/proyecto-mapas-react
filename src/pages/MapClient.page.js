import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, AsyncStorage  } from 'react-native';
import { Location, Permissions, MapView } from 'expo';
import { Marker, Polyline as PolylineDraw } from 'react-native-maps'
import Polyline from '@mapbox/polyline'

import axios from 'axios'

const TOKEN = 'pk.eyJ1IjoiZ2F0b2d0IiwiYSI6ImNqd29sbm5vcDBwaXA0NHQ1dDlnN2ZodnQifQ.XQRA6EUhIMUOM49MG34uwg'

const USUARIOS_URI = 'http://puceing.edu.ec:15005/FranciscoUlloa/mytaxifinder/api/usuarios'
const RUTAS_URI = 'http://puceing.edu.ec:15005/FranciscoUlloa/mytaxifinder/api/rutas'

export default class Home extends Component {
    static navigationOptions = {
        header: null
    }

    state = {
        latOrigen: null,
        lonOrigen: null,
        latDest: null,
        lonDest: null,
        coordCargadas: false,
        coords:[],
        time: 0,
        distance: 0,
        price: 0
    };

    componentWillMount() {
        this.getLocation()
    }

    getLocation = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Dar permisos por favor...',
            });
        }

        let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true })
        const { latitude, longitude } = location.coords

        this.setState({
            latOrigen: latitude,
            lonOrigen: longitude,
            coordCargadas: true
        })
    }

    getDirections = async (origenStr, destinoStr, latDest, lonDest) => {
        const uri = `https://api.mapbox.com/directions/v5/mapbox/driving/${origenStr}%3B${destinoStr}.json?access_token=${TOKEN}&geometries=polyline`
        try {
          const resp = await fetch(uri)
          const respJson = await resp.json()
          const response = respJson.routes[0]
          const time = response.duration
          const distance = response.distance
          const points = Polyline.decode(respJson.routes[0].geometry)
          const coords = points.map(point => {
            return {
              latitude: point[0],
              longitude: point[1]
            }
          })

          let distancia = Math.round(distance/10)/100
          let tiempo = Math.round((time/6))/10
          let precio = Math.round(distancia*60) / 100

          this.setState({
              coords,
              time: tiempo,
              distance: distancia,
              price: precio,
              latDest,
              lonDest
          })

        } catch(error) {
          console.log('Error: ', error)
        }
    }

    elegirDestino = (e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate
        const { latOrigen, lonOrigen } = this.state

        const origenStr = `${new String(lonOrigen).substring(0,8)}%2C${new String(latOrigen).substring(0,8)}`
        const destinoStr = `${new String(longitude).substring(0,8)}%2C${new String(latitude).substring(0,8)}`

        this.getDirections(origenStr, destinoStr, latitude, longitude)
    }

    borrarRuta = () => {
        this.setState({
            coords: [],
            time: 0,
            distance: 0,
            price: 0
        })
    }

    actualizarUbicacion = () => {
        this.borrarRuta()
        this.getLocation()
    }

    confirmarViaje = () => {
        let { latOrigen, lonOrigen, latDest, lonDest, distance, time, price } = this.state

        Alert.alert(
            'Mensaje',
            `¿Desea registrar el viaje por $${this.state.price}?`,[
                {
                    text: 'Cancel',
                    onPress: () => { return },
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        try{
                            const value = await AsyncStorage.getItem('userId')

                            const params = {
                                USUARIO_ID: parseInt(value.toString()),
                                ORIGEN_LAT: latOrigen.toString(),
                                ORIGEN_LONG: lonOrigen.toString(),
                                DESTINO_LAT: latDest.toString(),
                                DESTINO_LONG: lonDest.toString(),
                                PRECIO: price.toString(),
                                DISTANCIA: distance.toString(),
                                TIEMPO: time.toString(),
                                ESTADO: "P"
                            }

                            //await AsyncStorage.removeItem('userId')

                            axios.post(RUTAS_URI, params).then(response => {

                                if(response.data != null){
                                    alert('Viaje ingresado, por favor espere su taxi')
                                }else{
                                    alert('Error registrando viaje')
                                }

                            }).catch(error => {
                                alert('Error de conexión')
                            })

                        }catch(e){
                            alert('Error!')
                        }


                    }
                }
            ],
            {
                cancelable: false
            }
        )
    }

    render() {
        if (this.state.coordCargadas) {
            try{
                let { latOrigen, lonOrigen, coords, distance, time, price } = this.state

                return (
                    <View style={styles.container}>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: latOrigen,
                                longitude: lonOrigen,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421
                            }}>
                            <Marker
                                draggable
                                title={'Destino'}
                                coordinate={{ latitude: latOrigen, longitude: lonOrigen + 0.005}}
                                pinColor={'#519d79'}
                                onDrag={this.borrarRuta}
                                onDragEnd={this.elegirDestino}
                            />
                            <Marker
                                title={'Posicion Actual'}
                                coordinate={{ latitude: latOrigen, longitude: lonOrigen }}
                            />

                            <PolylineDraw
                                strokeColor={'rgba(255,0,0,1)'}
                                strokeWidth={3}
                                tappable
                                coordinates={coords}
                            />
                        </MapView>
                        <View style={styles.info}>
                            <Text style={styles.textInfo}>Distancia: {distance}</Text>
                            <Text style={styles.textInfo}>Tiempo: {time}</Text>
                            <Text style={styles.textInfo}>Precio: {price}</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            onPress={this.confirmarViaje}
                            style={styles.bubble}>
                            <Text style={styles.buttonText}>Aceptar Viaje :D</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={this.actualizarUbicacion}
                            style={styles.bubble}>
                            <Text style={styles.buttonText}>Actualizar mi ubicación...</Text>
                          </TouchableOpacity>
                        </View>
                    </View>
                );
            }catch(err){
                console.log(err)
            }
        }else{
            return (
                <View style={styles.container}>
                <Text style={styles.paragraph}>Obteniendo Coordenadas...</Text>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    paragraph: {
        margin: 24,
        fontSize: 18,
        textAlign: 'center'
    },
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    bubble: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        paddingHorizontal: 18,
        borderRadius: 20,
        height: 40,
        justifyContent: 'center',
        marginTop: 15
    },
    latlng: {
        width: 200,
        alignItems: 'stretch',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    info: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 20,
        padding: 15,
        width: '50%',
    },
    textInfo: {
        textAlign: 'center',
        fontWeight: 'bold'
    },
    buttonText:{
        textAlign: 'center',
    }

});
