import React, { Component } from "react";
import { View, Text, TouchableOpacity, Alert, Button, Image, StyleSheet, YellowBox } from "react-native";
import { FontAwesome, Ionicons,MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import delay from 'delay';
import * as VideoThumbnails from 'expo-video-thumbnails';
import MediaMeta from 'react-native-media-meta';
import _ from 'lodash';
import Constants from 'expo-constants';
import { withFirebaseHOC } from '../config/Firebase';
import * as FaceDetector from 'expo-face-detector';
import moment from 'moment';


YellowBox.ignoreWarnings(['Setting a timer','FirebaseStorageError']);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf('Setting a timer','FirebaseStorageError') <= -1) {
    _console.warn(message);
  }
};

const verifyPermissions = async () => {
  const result = await Permissions.askAsync(Permissions.AUDIO_RECORDING, Permissions.CAMERA_ROLL);
    if (result.status !== 'granted') {
      Alert.alert(
        'Insufficient permissions!',
        'You need to grant camera permissions to use this app.',
        [{ text: 'Okay' }]
      );
      return false;
    }
    return true;
};

const printChronometer = seconds => {
  const minutes = Math.floor(seconds / 60);
  const remseconds = seconds % 60;
  return '' + (minutes < 10 ? '0' : '') + minutes + ':' + (remseconds < 10 ? '0' : '') + remseconds;
};

class MyCam extends Component {
  state = {
    video: null,
    picture: null,
    type: Camera.Constants.Type.back,
    duration: 0,
    allowsEditing: true,
    image: null,
    faceDetected: false,
    recording: false,
    time: '',
  };

  registerRecord = async () => {
    const { recording, duration } = this.state;

    if (recording) {
      await delay(1000);
      this.setState(state => ({
        ...state,
        duration: state.duration + 1
      }));
      if (duration == 9 ) {
        this.setState({ recording: false }, () => {
          this.cam.stopRecording();
        });
      }
      this.registerRecord();
    }
  }

  mode = async (array) =>{
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

  _saveVideo = async () => {
    const { video } = this.state;
    const asset = await MediaLibrary.createAssetAsync(video.uri);
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
        return;
    }

    this.Thumbnail(video);

    if (!asset.cancelled){
      this.props.firebase.uploadVideo(video.uri)
      .then(() => {
        Alert.alert("Success");
      })
      .catch((error) =>{
        Alert.alert("error");
      });
    }



    if (asset) {
      this.setState({ video: null });
    }
    this.props.navigation.navigate('Home')
  };

  Thumbnail = async (video) => {
    try {
      const thumb = []
      for (i=0 , j=0 ; i<=10000 ; i=i+1000 , j++){
      const { uri } = await VideoThumbnails.getThumbnailAsync(
        video.uri,
        {
          time: 1000,
        }
      );
      this.setState({ image: uri})
      const source = await this.props.firebase.uploadImage(uri);
      const axios = require("axios");
        axios({
          "method":"POST",
          "url":"https://luxand-cloud-face-recognition.p.rapidapi.com/photo/emotions",
          "headers":{
          "content-type":"application/x-www-form-urlencoded",
          "x-rapidapi-host":"luxand-cloud-face-recognition.p.rapidapi.com",
          "x-rapidapi-key":"cc4c53fcabmshd4569bdc5cd7ab5p116e03jsn76edf31926b7"
          },"params":{
          "photo":source
          },"data":{

          }
          })
          .then((response)=>{
            //const selection = ["disgust","sadness", "anger","happiness","contempt","surprise","neutral"]
            const emotion = response.data.faces[0].emotions
            /*for (i=0;i<=selection.length;i++){
              if(emotion[selection[i]]>=0.5) {
              console.log(selection[i])
              }
            }*/
            var emoition = Object.keys(emotion).reduce((a, b) => emotion[a] > emotion[b] ? a : b);
            thumb[j] = emoition
            //console.log(emoition)
          })
          .catch((error)=>{
            console.log(error)
          })
      }
      const first = await this.mode(thumb)
      
      console.log("this emo " + first)
      await this.props.firebase.saveVideoEmo(first,this.state.time);
    } catch (e) {
      console.warn(e);
    }
  }

  componentDidMount() {
    //Getting the current date-time with required formate and UTC   
    var date = moment()
      .utcOffset('+02:00')
      .format('YYYY-MM-DD hh:mm:ss a');
  
    this.setState({ time: date });
    //Settign up time to show
  }

  _StopRecord = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
        return;
    }
    this.setState({ recording: false }, () => {
      this.cam.stopRecording();
    });
  };

  _StartRecord = async () => {
    const hasPermission = await verifyPermissions();
    this.setState({ duration : 0 });
    if (!hasPermission) {
        return;
    }
    if (this.cam) {
      this.setState({ recording: true }, async () => {
        this.registerRecord();
        const video = await this.cam.recordAsync({
          quality: '720p',
        });
        //MediaMeta.get(path)
        //.then((metadata) => {
        //  if (metadata.duration > maxTime ) {
        //    Alert.alert(
        //      'Sorry',
        //      'Video duration must be less then 10 seconds',
        //      [
        //        { text: 'OK', onPress: () => console.log('OK Pressed') }
        //      ],
        //      { cancelable: false }
        //    );
        //  } else {
        //    // Upload or do something else
        //  }
        //}).catch(err => console.error(err));

        this.setState({ video });

      });
    }

  };

  toogleRecord = async () => {
    const { recording } = this.state;
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
        return;
    }
    if (recording) {
      this._StopRecord();
    } else {
      this._StartRecord();
    }
  };

  switchType = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
        return;
    }
    let newType;
    const { back, front } = Camera.Constants.Type;

    if (this.state.type === back) {
      newType = front;
    } else if (this.state.type === front) {
      newType = back;
    }

    this.setState({
        ...this.state,
        type: newType,
    });
    this.setState({ duration : 0 });
  };

  choosePhotoFromLibrary = async () => {
    ImagePicker.launchImageLibraryAsync(  {
      width: 300,
      height: 400,
      mediaTypes:'Videos',
      cropping: true
    }).then(  video => {
      console.log(video);
      this.Thumbnail(video);
      if (!video.cancelled){
        this.props.firebase.uploadVideo(video.uri)
        .then(() => {
          Alert.alert("Success");
        })
        .catch((error) =>{
          Alert.alert("error");
        });
      }
    });
  };

  handleFacesDetected = ({ faces }) => {
    if (faces.length === 1){
      this.setState({
        faceDetected: true,
      });
      /*if (!this.state.faceDetected && !this.state.countDownStarted){
        this.initCountDown();
      }*/

    } else {
      this.setState({faceDetected: false });
      this.setState({ duration : 0 });
      //this.cancelCountDown();
    }
  }


  render() {
    const { recording, video, duration, faceDetected } = this.state;
    const { image } = this.state;
    return (
      <Camera
        ref={cam => (this.cam = cam)}
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          flex: 1,
          width: "100%"
        }}
        type={this.state.type}
        onFacesDetected={this.handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.Constants.Mode.fast,
          detectLandmarks: FaceDetector.Constants.Landmarks.none,
          runClassifications: FaceDetector.Constants.Classifications.none,
          minDetectionInterval: 100,
          tracking: true,
        }}
      >
        {video && (
          <TouchableOpacity
            onPress={this._saveVideo}
            style={{
              padding: 20,
              width: "30%",
              backgroundColor: "#fff"
            }}
          >
            <Text style={{ textAlign: "center" }}>save</Text>
          </TouchableOpacity>
        )}

        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            position: 'absolute',
            top: 20,
          }}>
            <Text
              style={styles.textStandard}>
              {this.state.faceDetected ? 'Face Detected' : 'No Face Detected'}
            </Text>
        </View>

        {faceDetected && (
        <TouchableOpacity
          onPress={this.toogleRecord}
          style={{
            padding: 20,
            width: "30%",
            marginBottom: -78,
            backgroundColor: recording ? "#ef4f84" : "#4fef97"
          }}
        >
          <Text style={{ textAlign: "center" }}>
            {recording ? "Stop" : "Record"}
          </Text>
        </TouchableOpacity>
        )}

        <TouchableOpacity
            onPress={()=>this.switchType()}
            style={{
              alignSelf: 'flex-end',
              alignItems: 'center',
              backgroundColor: 'transparent',
              marginBottom: -5,
            }}
            >
            <MaterialCommunityIcons
                name="camera-switch"
                style={{ color: "#fff", fontSize: 40}}
            />
        </TouchableOpacity>

        {faceDetected && (
        <TouchableOpacity onPress={this.choosePhotoFromLibrary}
            style={{
              alignSelf: 'flex-end',
              alignItems: 'center',
              backgroundColor: 'transparent',
              marginBottom: -60,
            }}
            >
            <MaterialCommunityIcons name="camera-burst" style={{ color: "#fff", fontSize: 40}}/>
        </TouchableOpacity>
        )}

        {faceDetected && (
        <Text
        style={{
          alignSelf: 'flex-start',
          padding: 20,
          width: "22%",
          backgroundColor: "#fff"
        }}
        >{printChronometer(duration)}</Text>
        )}

      </Camera>
    );
  }
}
const styles = StyleSheet.create({
  textStandard: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white'
  }
});

export default withFirebaseHOC(MyCam);
