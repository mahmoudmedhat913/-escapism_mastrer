import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';
console.disableYellowBox=true;

import { withFirebaseHOC } from '../config/Firebase'

class Profile extends Component {
  state = {
     userDetails: []
   }

 componentDidMount() {
     this.fetchUserDetails()
   }

   fetchUserDetails = async () => {
     try {
          var userDetails = await this.props.firebase.getUserDetails();
          this.setState({ userDetails })
          console.log('USER DETAILS ===========>>', userDetails)
        } catch (error) {
       console.log(error)
      }
   }

   handleSignout = async () => {
     try {
       await this.props.firebase.signOut()
     } catch (error) {
       console.log(error)
     }
   }

   handleEditAvatarNavigation = () => {
     this.props.navigation.navigate('EditAvatar' ,{Profile: this})
   }

  render() {
    const {  userDetails } = this.state
    const img ={uri: userDetails[2]};
    return (
          <View style={styles.container}>
              <View style={styles.header}></View>
              <Image style={styles.avatar} source={img}/>
              <View style={styles.body}>
                <View style={styles.bodyContent}>
                  <Text style={styles.name}>{userDetails[0]}</Text>
                  <Text style={styles.info}>{userDetails[1]}</Text>

                  <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={this.handleEditAvatarNavigation}
                  >
                    <Text>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonContainer}
                  onPress={this.handleSignout}
                  >
                    <Text>Log out</Text>
                  </TouchableOpacity>
                </View>
            </View>
          </View>
        );

  }
}


const styles = StyleSheet.create({
  header:{
    backgroundColor: "#00BFFF",
    height:200,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: "white",
    marginBottom:10,
    alignSelf:'center',
    position: 'absolute',
    marginTop:130
  },
  name:{
    fontSize:22,
    color:"#FFFFFF",
    fontWeight:'600',
  },
  body:{
    marginTop:40,
  },
  bodyContent: {
    flex: 1,
    alignItems: 'center',
    padding:30,
  },
  name:{
    fontSize:28,
    color: "#696969",
    fontWeight: "600"
  },
  info:{
    fontSize:16,
    color: "#00BFFF",
    marginTop:10
  },
  description:{
    fontSize:16,
    color: "#696969",
    marginTop:10,
    textAlign: 'center'
  },
  buttonContainer: {
    marginTop:10,
    height:45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:20,
    width:250,
    borderRadius:30,
    backgroundColor: "#00BFFF",
  },
});

export default withFirebaseHOC(Profile)
