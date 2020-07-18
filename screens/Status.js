import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

console.disableYellowBox=true;


  class Status extends Component{
    render(){

        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' , backgroundColor: '#FBF0D2' }}>
              <Text>Status!</Text>
            </View>
          );
}
}

Status.navigationOptions = {
  headerTitle: 'Status'
};
export default Status;
