import React from 'react';
import { Text, View, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native';
import * as firebase from 'firebase';

export default class LoginScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            emailId: "",
            password: ""
        }
    }

    login = async(email, password) => {
        if(email && password){
            try{
                const response = await firebase.auth().signInWithEmailAndPassword(email, password);
                if(response){
                    this.props.navigation.navigate('Transaction')
                }
            }
            catch(error){
                switch(error.code){
                    case 'auth/user-not-found': Alert.alert("User doesn't exist")
                    break;
                    case 'auth/invalid-email': Alert.alert("Email is invalid")
                    break;
                }
            }
        }
        
        else{
            Alert.alert("Enter your email and password");
        }
    }

    render(){
        return(
            <View>
                <Text>
                    Login
                </Text>

                <View>
                    <TextInput
                        placeholder = "Enter Your Email"
                        keyboardType = "email-address"
                        onChangeText = {(text) =>{
                            this.setState({
                                emailId: text
                            })
                        }}  
                    />

                    <TextInput
                        placeholder = "Enter Your Password"
                        secureTextEntry = {true}
                        onChangeText = {(text) =>{
                            this.setState({
                                password: text
                            })
                        }}  
                    />
                </View>
                
                <View>
                    <TouchableOpacity
                        style = {styles.loginButton}
                        onPress = {() => {
                            this.login(this.state.emailId, this.state.password);
                        }}
                    >
                        <Text>
                            Login
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    loginButton: {
        backgroundColor: 'rgb(20, 50, 200)',
        borderRadius: 2
    }
})