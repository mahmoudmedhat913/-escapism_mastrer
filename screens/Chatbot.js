import React, { Component } from 'react';
import { StyleSheet, Text, View ,TouchableOpacity} from 'react-native';
import { GiftedChat  } from 'react-native-gifted-chat';
import { Dialogflow_V2 } from 'react-native-dialogflow';
import { dialogflowConfig } from '../env';
import { withFirebaseHOC } from '../config/Firebase'
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { Icon } from 'react-native-elements'
import * as Permissions from 'expo-permissions';
import axios from "axios";

console.disableYellowBox=true;
 const BOT_USER = {
    _id: 2,
    name: 'escapism bot',
    //avatar: 'https://i.imgur.com/7k12EPD.png'
  };


  class Chatbot extends Component {
    state = {
      messages: [],

     /* messages: [
        {
        _id: 1,
        text: '`Hi! I am the ESCAPISM bot 🤖.\n\n AM here to help you feel better`',
        createdAt: new Date(),
        user: BOT_USER ,
        quickReplies: {
          type: 'radio', // or 'checkbox',
          keepIt: true,
          values: [
            {
              title: '😋 hi escapism',
              //value: 'yes',
            },
            {
              title: 'nice to meet you!',
              //value: 'yes_picture',
            },
            {
              title: 'hi there',
              //value: 'no',
            },
          ],
        }
      }
      ],*/
      userDetails: [],
      //is_picking_video: false,


    };

    componentDidMount() {
       this.fetchUserChat(),
      this.fetchUserDetails(),
      Dialogflow_V2.setConfiguration(
        dialogflowConfig.client_email,
        dialogflowConfig.private_key,
        Dialogflow_V2.LANG_ENGLISH_US,
        dialogflowConfig.project_id
      );
    };

    fetchUserDetails = async () => {
      try {
           var userDetails = await this.props.firebase.getUserDetails();
           this.setState({ userDetails })
           // console.log('USER DETAILS ===========>>', userDetails)
         } catch (error) {
        console.log(error)
       }
    };

    fetchUserChat = async () => {
      try {
           var messages = await this.props.firebase.fetchChat();
           this.setState({ messages})
           console.log('USER chat ===========>>', messages)
         } catch (error) {
        console.log(error)
       }
    };

    postMsg = async (msg) => {

   const form = new FormData()
   form.append('api_key', 'slMrROo1PbxnRejhauzT2UU2oCWR0MWWgxRG4wgmPMc')
   form.append('text', msg)
   form.append('lang_code', 'en')

    axios({
      "method": "POST",
      "url": "https://apis.paralleldots.com/v5/emotion",
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      "data": form,
      "params":form,

     }).then((response) => {
        let emoObject = response.data.emotion;
        var emoition = Object.keys(emoObject).reduce((a, b) => emoObject[a] > emoObject[b] ? a : b);
        console.log(emoition);
       this.props.firebase.saveEmo(emoition);
    }).catch((err) => {
     console.log("ERROR: ====", err);
   });

    };

    handleGoogleResponse(result) {
      let inlineEditorText = result.queryResult.fulfillmentMessages[0].text.text[0];
      let dafultIntentText = result.queryResult.fulfillmentText;
      let text ;
      if (inlineEditorText==undefined)
      {
        text = dafultIntentText;
      }
      else
      {
        text=inlineEditorText;
      }
      //let quickText =result.queryResult.fulfillmentMessages[1].suggestions.suggestions;
      let quickTextString =result.queryResult.fulfillmentMessages[1].quickReplies.quickReplies;
      let i;
      let quickText =[];
      for (i = 0; i < quickTextString.length; i++) 
        {
          let obj =
          {
            title :quickTextString[i]
          };
          quickText.push(obj);
        }
      this.sendBotResponse(text,quickText);
      //this.onQuickReply(replies);
    };
    onSend = async (messages = []) => {
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, messages)
      }));
      let message = messages[0].text;
       this.postMsg(message);


      Dialogflow_V2.requestQuery(
        message,
        result => this.handleGoogleResponse(result),
        error => console.log(error)
      );
      let msg  = messages[0];
       await this.props.firebase.pushMessage(msg);

    };
    onQuickReply = replies => {
      const createdAt = new Date()
      if (replies.length === 1) {
        this.onSend([
          {
            createdAt,
            _id: Math.round(Math.random() * 1000000),
            text: replies[0].title,
            user: {
              _id: 1,
              name: 'FAQ Bot',
              avatar: 'https://i.imgur.com/7k12EPD.png'
            }
          },
        ])
      } else if (replies.length > 1) {
        this.onSend([
          {
            createdAt,
            _id: Math.round(Math.random() * 1000000),
            text: replies.map(reply => reply.title).join(', '),
            user: {
              _id: 2,
              name: 'FAQ Bot',
              avatar: 'https://i.imgur.com/7k12EPD.png'
            }
             
          },
        ])
      } else {
        console.warn('replies param is not set correctly')
      }
    }
 sendBotResponse = async (text,quickText) => {
      let msg = {
        _id: this.state.messages.length + 1,
        text,
        createdAt: new Date(),
        user: BOT_USER,
        quickReplies :{
          type: 'radio', // or 'checkbox',
          keepIt: true,
          values:quickText,
        }

      };
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, [msg])
      }));
       await this.props.firebase.pushMessage(msg);

    };
    Camerashow = async () => {
    await Permissions.askAsync(Permissions.CAMERA_ROLL, Permissions.CAMERA);
    this.props.navigation.navigate('Camera')
  };
    renderCustomActions = () => {
    // if (!this.state.is_picking_video) {

      return (
        <View style={styles.customActionsContainer}>
          <TouchableOpacity onPress={this.Camerashow}>
            <View style={styles.buttonContainer}>
            <Icon
              name='camera'
              color='black' />
               </View>
          </TouchableOpacity>
        </View>
      );
    // }


  }


    render() {
      const { userDetails , messages } = this.state

      return (
        <View style={{ flex: 1, backgroundColor: '#FBF0D2' }}>
          <GiftedChat
            showUserAvatar = 'true'
            isTyping = 'true'
            placeholder = 'chat with me'
            messages={this.state.messages}
            replies= {this.state.replies}
            onSend={messages => this.onSend(messages)}
            onQuickReply={replies => this.onQuickReply(replies)}
            user={{
              _id: 1,
              createdAt: new Date(),
              name: userDetails[0],
              email:  userDetails[1],
              avatar: userDetails[2],
              id:  userDetails[3],
            }}
            renderActions={this.renderCustomActions}

          />
        </View>
      );
    }
  }
  const styles = StyleSheet.create({
    customActionsContainer: {
     flexDirection: "row",
     justifyContent: "space-between"
   },
   buttonContainer: {
     padding: 10
   },
  })
export default withFirebaseHOC(Chatbot);
