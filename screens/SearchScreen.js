import React from 'react';
import { Text, View, ScrollView, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import db from '../config';

export default class SearchScreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      allTransactions: [],
      lastVisibleTransaction: null,
    }
  }

  componentDidMount = async() => {
    const query = await db.collection("Transaction").limit(10).get();
    query.docs.map((doc) => {
      console.log("yes");
      this.setState({
        allTransactions: [...this.state.allTransactions, doc.data()],
        lastVisibleTransaction: doc
      })
    })
  }

  fetchMoreTransactions = async() => {
    const query = await db.collection("Transaction").startAfter(this.state.lastVisibleTransaction).limit(10).get();
    query.docs.map((doc) => {
      this.setState({
        allTransactions: [...this.state.allTransactions, doc.data()],
        lastVisibleTransaction: doc
      })
    })
  }

  render() {
    return (
      <View style = {styles.container}>

        <View>
          <TextInput
          placeholder = "Enter Book or Student ID"
          onChangeText = {(text) => {
            this.setState({
              search: text
            })
          }}
          />
        </View>


        <FlatList
          data = {this.state.allTransactions}
          renderItem = {({item})=>(
            <View>
              <Text>{"BookID:" + item.BookID}</Text>
              <Text>{"StudentID:" + item.StudentID}</Text>
              <Text>{"TransactionType:" + item.TransactionType}</Text>
              <Text>{"Date:" + item.Date.toDate()}</Text>
            </View> 
          )}
          keyExtractor= {(item, index)=> index.toString()}
          onEndReached = {this.fetchMoreTransactions}
          onEndReachedThreshold = {0.7}
        />

      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20
  },
})