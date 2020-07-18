import React, { Component } from 'react';
import { StyleSheet, Text, View ,TouchableOpacity ,Button } from 'react-native';
import { withFirebaseHOC } from '../config/Firebase';
import CheckBox from 'react-native-check-box';
import DateTimePicker from "react-native-modal-datetime-picker";
import RNPickerSelect from 'react-native-picker-select';
import { TextInput } from 'react-native-paper';
import { format } from "date-fns";
import {Notifications} from 'expo';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as MTracker  from './MTracker';

class Activityoption extends Component {
    constructor(props){
      super(props);
   
      this.state = {
         isChecked: false,
         isDateTimePickerVisible: false,
         text: '',
         options: [],
      }
   }
  
    showDateTimePicker = () => {
      this.setState({ isDateTimePickerVisible: true });
    };
  
    hideDateTimePicker = () => {
      this.setState({ isDateTimePickerVisible: false });
    };
  
    handleDatePicked = async date => {
      //console.log("A date has been picked: ", date);
      this.hideDateTimePicker();
      var formattedDate = format(date, "yyyy-MM-dd");
      var formattedtime = format(date, "H:mma")
  
      var milliseconds = date.getTime(); 
  
      if(this.state.isChecked == true) {
        const localNotification = {
            title: 'done',
            body: 'done!'
        };
  
        const schedulingOptions = {
            time: milliseconds,
            repeat: this.state.options[0]
        }
  
        // Notifications show only when app is not active.
        // (ie. another app being used or device's screen is locked)
        Notifications.scheduleLocalNotificationAsync(
            localNotification, schedulingOptions
        );
      }
  
      console.log(formattedDate);
      console.log(formattedtime);
      this.state.options[2]=formattedDate;
    };
  
    handleNotification() {
        console.warn('ok! got your notif');
    }
  
    async componentDidMount() {
        // We need to ask for Notification permissions for ios devices
        let result = await Permissions.askAsync(Permissions.NOTIFICATIONS);
  
        if (Constants.isDevice && result.status === 'granted') {
            console.log('Notification permissions granted.')
        }
  
        // If we want to do something with the notification when the app
        // is active, we need to listen to notification events and 
        // handle them in a callback
        Notifications.addListener(this.handleNotification);
    }
  
    _option = async (options) => {
      //this.setState({ options}, () => console.warn('Selected Activities: ', options))
      await this.props.firebase._saveoption(options)
      this.props.navigation.navigate('Activity')
    }
  
    render() {
    return (
      <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop:50,
            width: "100%"
          }}
        >
      <RNPickerSelect
            onValueChange={(value) => this.state.options[0]=value}
            style={{marginLeft:50}}
            items={[
                { label: 'Every Day', value: 'day' },
                { label: 'Every Week', value: 'week' },
                { label: 'Every Month', value: 'month' },
                { label: 'Every Year', value: 'year' },
            ]}
        />
      <CheckBox
          style={{
            marginRight:15,
            marginTop:40,
            marginLeft:15,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F5FCFF',}}
            
          onClick={()=>{
            this.setState({
              isChecked:!this.state.isChecked
          })
        }}
        isChecked={this.state.options[1] = this.state.isChecked}
        leftText={"Reminder"}
        />
        <TouchableOpacity onPress={this.showDateTimePicker} style={{marginTop:45}} >
        <Text>Pick Date and Time</Text>
        </TouchableOpacity>
        <DateTimePicker
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this.handleDatePicked}
          onCancel={this.hideDateTimePicker}
          mode={'datetime'}
        />
        <TextInput
          label='Note'
          value={this.state.options[3] = this.state.text}
          style={{width:330, marginTop:40,}}
          onChangeText={text => this.setState({ text })}
        />
        <TouchableOpacity 
          style={{
            padding: 20,
            width: "30%",
            marginTop:110,
            backgroundColor: "#4fef97"
          }}
          onPress={() => this._option(this.state.options)}
        >
          <Text style={{ textAlign: "center" }}>save</Text>
        </TouchableOpacity>
      </View>
    );
    }
  }
  //<Button onPress={this._show(isChecked)} title='add'/>
  
  export default withFirebaseHOC(Activityoption);