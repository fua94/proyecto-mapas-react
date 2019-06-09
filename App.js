import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Location, Permissions, MapView } from 'expo';
import { Marker, Polyline as PolylineDraw } from 'react-native-maps'
import Polyline from '@mapbox/polyline'

const TOKEN_URI = 'pk.eyJ1IjoiZ2F0b2d0IiwiYSI6ImNqd29sbm5vcDBwaXA0NHQ1dDlnN2ZodnQifQ.XQRA6EUhIMUOM49MG34uwg'

export default class Home extends Component {

    state = {
        latOrigen: null,
        lonOrigen: null,
        coordCargadas: false,
        coords:[],
        time: 0,
        distance: 0
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

    getDirections = async (origen, destino) => {
        const uri = `https://api.mapbox.com/directions/v5/mapbox/driving/${origen}%3B${destino}.json?access_token=${TOKEN_URI}&geometries=polyline`
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
          this.setState({ coords, time, distance })

        } catch(error) {
          console.log('Error: ', error)
        }
    }

    elegirDestino = (e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate
        const { latOrigen, lonOrigen } = this.state

        const origen = `${new String(lonOrigen).substring(0,8)}%2C${new String(latOrigen).substring(0,8)}`
        const destino = `${new String(longitude).substring(0,8)}%2C${new String(latitude).substring(0,8)}`

        this.getDirections(origen, destino)
    }

    borrarRuta = () => {
        this.setState({
            coords: [],
            time: 0,
            distance: 0
        })
    }

    actualizarUbicacion = () => {
        this.borrarRuta()
        this.getLocation()
    }

    render() {
        if (this.state.coordCargadas) {
            try{
                let { latOrigen, lonOrigen, coords, distance, time } = this.state

                return (
                    <View style={styles.container}>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: latOrigen,
                                longitude: lonOrigen,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421
                            }}
                            onPress={() => console.log('mapa presionado!')}>
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
                                onPress={() => console.log('polilinea presionada!')}
                                strokeWidth={3}
                                tappable
                                coordinates={coords}
                            />
                        </MapView>
                        <View>
                            <Text>Distancia: {Math.round(distance/10)/100}Km</Text>
                        </View>
                        <View>
                            <Text>Tiempo: {Math.round((time / 6)) / 10} min aprox.</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            onPress={this.actualizarUbicacion}
                            style={styles.bubble}>
                            <Text>Actualizar mi ubicación...</Text>
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
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginVertical: 20,
        backgroundColor: 'transparent',
    },
    bubble: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20,
    },
    latlng: {
        width: 200,
        alignItems: 'stretch',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});
