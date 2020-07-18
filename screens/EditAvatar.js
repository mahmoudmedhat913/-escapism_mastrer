import React, { Component } from 'react'
import { View, Image } from 'react-native'
import { Button, Text } from 'react-native-ui-kitten'
import * as ImagePicker from 'expo-image-picker';

import { withFirebaseHOC } from '../config/Firebase'
console.disableYellowBox=true;

class EditAvatar extends Component {
  state = {
    avatarImage: null,
    aImage:""
  }


  selectImage = async () => {
  
    let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

   if (permissionResult.granted === false) {
     alert('Permission to access camera roll is required!');
     return;
   }

   let pickerResult = await ImagePicker.launchImageLibraryAsync();

   if (pickerResult.cancelled === true) {
     return;
   }
          const source = { uri: pickerResult.uri }
          this.setState({
               avatarImage: source,
               aImage: pickerResult.uri
            })

  }

  onSubmit = async () => {
    try {
      let aImage = this.state.aImage

      await this.props.firebase.uploadAvatar(aImage);


    let  usrDetails= await this.props.firebase.getUserDetails();
      this.props.navigation.state.params.Profile.setState({userDetails:usrDetails});


      this.setState({
        avatarImage: null,
        aImage:""

      })

    } catch (e) {
      console.error(e)
    }
  }


  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text category='h2'>Edit Avatar</Text>
        <View>
          {this.state.avatarImage ? (
            <Image
              source={this.state.avatarImage}
              style={{ width: 300, height: 300 }}
            />
          ) : (
            <Button
              onPress={this.selectImage}
              style={{
                alignItems: 'center',
                padding: 10,
                margin: 30
              }}>
              Add an image
            </Button>
          )}
        </View>
        <Button
          status='success'
          onPress={this.onSubmit}
          style={{ marginTop: 30 }}>
          Proceed
        </Button>
      </View>
    )
  }
}

export default withFirebaseHOC(EditAvatar)
