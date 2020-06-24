import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Image, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
  constructor(){
    super();
    this.state = {
      HasCameraPermission: null,
      Scanned: false,
      ScannedData: '',
      ButtonState: 'normal',
      ScannedBookID: '',
      ScannedStudentID: '',
      transactionMessage: '',
    }
  }

  GetCameraPermission = async(ID) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      HasCameraPermission: status === "granted",
      ButtonState: ID,
      Scanned: true
    });
  }

  handleBarCodeScanned  = async ({type, data})=>{
    console.log("IM HERE");
    const { ButtonState } = this.state;

    if(ButtonState === "BookID"){
      this.setState({
        Scanned : true,
        ScannedBookID : data,
        ButtonState : 'normal'
      });
    }
    else if(ButtonState === "StudentID"){
      this.setState({
        Scanned : true,
        ScannedStudentID : data,
        ButtonState : 'normal'
      })
    }
  }

  initiateBookIssue = async() => {
    db.collection("Transaction").add({
      'StudentID': this.state.ScannedStudentID,
      'BookID': this.state.ScannedBookID,
      'Date': firebase.firestore.Timestamp.now().toDate(),
      'TransactionType': "issue",
    })
    db.collection("Books").doc(this.state.ScannedBookID).update({
      'BookAvailability': false
    })
    db.collection("Students").doc(this.state.ScannedStudentID).update({
      'IssuedBooksNumber': firebase.firestore.FieldValue.increment(1)
    })

    alert("Book has been successfully issued");
    this.setState({
      ScannedBookID: '',
      ScannedStudentID: '',
    })
  }

  initiateBookReturn = async() => {
    db.collection("Transaction").add({
      'StudentID': this.state.ScannedStudentID,
      'BookID': this.state.ScannedBookID,
      'Date': firebase.firestore.Timestamp.now().toDate(),
      'TransactionType': "return"
    })
    db.collection("Books").doc(this.state.ScannedBookID).update({
      'BookAvailability': true
    })
    db.collection("Students").doc(this.state.ScannedStudentID).update({
      'IssuedBooksNumber': firebase.firestore.FieldValue.increment(-1)
    })

    this.setState({
      ScannedBookID: '',
      ScannedStudentID: ''
    })
  }

  checkStudentEligibilityForBookIssue = async() => {
    var ref = await db.collection('Students').where('StudentID', '==', this.state.ScannedStudentID).get();
    var isStudentEligible = "";
    if(ref.docs.length == 0){
      this.setState({
        ScannedBookID: '',
        ScannedStudentID: ''
      });
      isStudentEligible = false;
      ToastAndroid.show("The Student ID doesn't exist");
    }
    else{
      ref.docs.map((doc) => {
        var student = doc.data();
        if(student.IssuedBooksNumber < 2){
          isStudentEligible = true;
        }
        else{
          isStudentEligible = false;
          this.setState({
            ScannedStudentID: '',
            ScannedBookID: ''
          })
          alert("The student has already issued 2 books");
        }
      })
    }
    return(isStudentEligible);
  }

  checkStudentEligibilityForBookReturn = async() => {
    var ref = await db.collection('Transaction').where('BookID', '==', this.state.ScannedBookID).limit(1).get();
    var isStudentEligible = '';
    ref.docs.map((doc)=>{
      var lastBookTransaction = doc.data();
      if(lastBookTransaction.StudentID === this.state.ScannedStudentID){
        isStudentEligible = true
      }
      else {
        isStudentEligible = false
        Alert.alert("The book wasn't issued by this student!")
        this.setState({
          ScannedStudentID: '',
          ScannedBookID: ''
        })
      }
    })
    return(isStudentEligible);
  }

  checkBookEligibility = async() => {
    var ref = await db.collection('Books').where('BookID', '==', this.state.ScannedBookID).get();
    var transactionType = "";
    if(ref.docs.length == 0){
      transactionType = false;
    }
    else{
      ref.docs.map((doc) => {
        var book = doc.data();
        if(book.BookAvailability){
          transactionType = "issue";
        }
        else{
          transactionType = "return";
        }
      })
    }
    return(transactionType);
  }

  handleTransaction = async() => {
    var transactionMessage;
    var transactionType = await this.checkBookEligibility();
    console.log(transactionType);

    if(!transactionType){
      ToastAndroid.show("The book doesn't exist in the library", ToastAndroid.SHORT);
      this.setState({
        ScannedStudentID: '',
        ScannedBookID: ''
      })
    }
    else if(transactionType === "issue"){
      var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
      if(isStudentEligible){
        this.initiateBookIssue();
        ToastAndroid.show("The book has been issued to the student", ToastAndroid.SHORT);
      }
    }
    else{
      var hasStudentIssued = await this.checkStudentEligibilityForBookReturn();
      if(hasStudentIssued){
        this.initiateBookReturn();
        ToastAndroid.show("The book has been returned by the student", ToastAndroid.SHORT);
      }
    }

    
  }

  render() {
    const HasCameraPermission = this.state.HasCameraPermission;
    const Scanned = this.state.Scanned;
    console.log(Scanned);
    const ButtonState = this.state.ButtonState;

    if(ButtonState !== "normal" && HasCameraPermission){
      return(
        <BarCodeScanner
          onBarCodeScanned={!Scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
    else if(ButtonState === "normal"){
      return (
        <KeyboardAvoidingView style = {styles.container}
          behavior = "padding" enabled
        >
          <View>

            <View>
              <Text style = {styles.headerText}>
                Wireless Library App
              </Text>
              <Image
                style = {{
                  width: 100,
                  height: 100,
                  marginLeft: 100
                }}
                source = {require('../assets/booklogo.jpg')}
              />
            </View>

            <View>
              <TextInput
                style = {styles.inputBox}
                placeholder = "BookID"
                value = {this.state.ScannedBookID}
                onChangeText = {text => this.setState({
                  ScannedBookID: text
                })}
              />

              <TouchableOpacity
                style = {styles.Button}
                onPress = {() => {
                  this.GetCameraPermission("BookID");
                }}
              >
                <Text style = {styles.ButtonText}> Scan QR Code </Text>
              </TouchableOpacity>
            </View>
          
            <View>
              <TextInput
                style = {styles.inputBox}
                placeholder = "StudentID"
                value = {this.state.ScannedStudentID}
                onChangeText = {text => this.setState({
                  ScannedStudentID: text
                })}
              />

              <TouchableOpacity
                style = {styles.Button}
                onPress = {() => {
                  this.GetCameraPermission("StudentID");
                }}
              >
                <Text style = {styles.ButtonText}> Scan QR Code </Text>
              </TouchableOpacity>
            </View>
            
            <View>
              <TouchableOpacity
                onPress = {this.handleTransaction}
              >
                <Text style = {styles.submitText}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
  Button: {
    backgroundColor: 'rgb(50, 200, 100)',
    padding: 10,
  },
  ButtonText: {
    fontSize: 15,
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 30
  },
  submitButton: {
    width: 100,
    height: 50,
    padding: 10
  },
  submitText: {
    textAlign: 'center',
    fontSize: 15
  }
})