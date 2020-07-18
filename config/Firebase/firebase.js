import * as firebase from 'firebase'
import 'firebase/auth'
import firebaseConfig from './firebaseConfig'
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig); }

const Firebase = {

   // auth
  loginWithEmail: (email, password) => {
    return firebase.auth().signInWithEmailAndPassword(email, password)
  },
  signupWithEmail: (email, password) => {
    return firebase.auth().createUserWithEmailAndPassword(email, password)
  },
  signOut: () => {
    return firebase.auth().signOut()
  },
  checkUserAuth: user => {
    return firebase.auth().onAuthStateChanged(user)
  },
  passwordReset: email => {
    return firebase.auth().sendPasswordResetEmail(email)
  },
  createNewUser: userData =>{
    var ref =firebase.database().ref('users/' + `${userData.uid}`);

    const BOT_USER = {
       _id: 2,
       name: 'escapism bot',
     };


    ref.set(userData).then((data)=>{
        console.log('data ' , data)
    }).catch((error)=>{
        console.log('error ' , error)
    });
    ref.child("emo").set({
        textEmo: {
     sad: 1,
     angry: 1,
     happy:1,
     fear :1,
     excited:1,
     indifferent:1
   },
   textEmo:0,
   videoEmo:0,
     });
    var ts = firebase.database.ServerValue.TIMESTAMP;
   var name =userData.name;
   const msg=
   { _id:1,
     text: `hi ${userData.name} this is escapism we are here for you feel free talk to me`,
     createdAt: ts,
     user: BOT_USER,
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
   };


    return ref.child('chat').push(msg);


},

getUserDetails: () => {
   let user = firebase.auth().currentUser
     var userid= user.uid;
     var ref = firebase.database().ref('users/').child(`${userid}`);

       return ref.once('value').then((snapshot) => {
       var name = snapshot.child("name").val();
       var email = snapshot.child("email").val();
       var uri = snapshot.child("avatar").val();
       var uid = snapshot.child("uid").val();


       var arr =[name,email,uri,uid];
       return arr;
     }).catch(function(error) {
       console.log( error)
     })
 },

  uploadAvatar:async (avatarImage) => {
    let user = firebase.auth().currentUser
   var userid= user.uid;
      const response = await fetch(avatarImage);
     const blob = await response.blob();

     var ref = firebase.storage().ref().child("userPic/" + `${userid}`);
     const snapshot = await ref.put(blob);
    var image = await snapshot.ref.getDownloadURL();
    var ref = firebase.database().ref('users/').child(`${userid}`);
    return ref.update( {avatar: image});
    },




     fetchChat: ()=> {
       let user = firebase.auth().currentUser
         var userid= user.uid;
         if(user){
         var ref = firebase.database().ref('users/' + `${userid}`).child('chat');
           return ref.once('value').then((snapshot) => {
         const chatObject = snapshot.val();


        let chatList = Object.keys(chatObject).map(key => ({
         ...chatObject[key],
       }));


          return chatList.reverse();
         }).catch(function(error) {
           console.log( error)
         })
       }

  },

pushMessage: message  =>{
     let user = firebase.auth().currentUser;
     var userid= user.uid;
      var ts = firebase.database.ServerValue.TIMESTAMP;
      var ref = firebase.database().ref('users/' + `${userid}`);
     return ref.child('chat').push(
       {
         _id:message._id,
         text: message.text,
         createdAt: ts,
         user:message.user
       }
     ).then((data)=>{
     }).catch((error)=>{
         console.log('error ' , error)
     })

    },

    uploadVideo: async (uri) => {
      let user = firebase.auth().currentUser
      var userid= user.uid;
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        let base64 = reader.result;
      };
      var name="123"+Date.now();
      var ref = firebase.storage().ref("videos/" + `${userid}`).child(name);
      const result2 = await ref.put(blob)
      const downloadURL = await result2.ref.getDownloadURL();
      console.log(downloadURL);
      return result2;
    },

    uploadImage: async (Image) => {
      const response = await fetch(Image);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        let base64 = reader.result;
        //console.log(base64);
      };
      var name="123"+Date.now();
      var ref = firebase.storage().ref().child("userPic/" + name);
      const snapshot = await ref.put(blob);
      var image = await snapshot.ref.getDownloadURL();
      console.log(image)

      //var ref = firebase.database().ref('users/').child(name);
      return image
      //ref.off();
    },


  textApi: (text) => {
  let user = firebase.auth().currentUser
    var userid= user.uid;
    var ref = firebase.database().ref('users/' + `${userid}` ).child("emo");
    ref.push(text);
 },

 saveEmo: async (emo) => {
   let user = firebase.auth().currentUser
     var userid= user.uid;
     var ref = firebase.database().ref('users/' + `${userid}`).child("emo");
  return ref.child("textEmo").transaction((data) => {
       if(data) {
         switch(emo) {
         case "sad":
           if(data.sad) {
               data.sad++;}
           break;
           case "happy":
           if(data.happy) {
               data.happy++;}
            break;

            case "angry":
              if(data.angry) {
                  data.angry++;}
              break;
              case "fear":
              if(data.fear) {
                  data.fear++;}
               break;

               case "excited":
                 if(data.excited) {
                     data.excited++;}
                 break;
                 case "indifferent":
                 if(data.indifferent) {
                     data.indifferent++;}
                  break;

          }

       }
       let emotions = data;
       let emoition = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
       firebase.database().ref('textEmo').set(emoition);
       // ref.child("textEmoFinal").set(emoition);
       return data;

  })
  .then(console.log('Done'))
  .catch((error) => console.log(error));
 },
 saveVideoEmo: async (emotion,time) => {
  let user = firebase.auth().currentUser
  var userid= user.uid;
  firebase.database().ref('users/' + `${userid}`).child('emo').child('videoEmo').push({
    emotion,
    time,
  });
  firebase.database().ref('userEmo/' + 'emo').set(emotion);
  console.log("success")
 },
 _showdata: async () => {
   let arrdata = []
    firebase.database().ref('Entry/').on('value', (snapshot) =>{
      arrdata = snapshot.val().selectedItems
    })
    return arrdata;
  },

  _saveoption: async (options) => {
    //this.setState({ options}, () => console.warn('Selected Activities: ', options))
    console.log(options);
    let actname;
    firebase.database().ref('activity_name/').on('value', (snapshot) =>{
        actname = snapshot.val()
    });
    firebase.database().ref(`${actname}`).set({
      options
    });
  },

  writeuserdata: async (selectedItems) => {//=>Write in fire base and retrive data
    firebase.database().ref('Userdata/').set(
      {
      time:this.state.time,
      selectedItems,

     }).then(()=>{console.log('data');}).catch((error)=>
     {console.log('error')})
     .then(() => {
       firebase.database().ref('Userdata/').on('value', (snapshot) =>{
       this.setState({
      selectedItems: snapshot.val().selectedItems,
      time:snapshot.val().time,
     })
     console.log(snapshot.val())
    })
    })
    },

    _selecteditems: async (initialArr) => {
      firebase.database().ref('Userdata/').on('value', (snapshot) =>{
        initialArr = snapshot.val().selectedItems
      })
      return initialArr;
    },

    _time: async (timeArr) => {
      firebase.database().ref('Userdata/').on('value', (snapshot) =>{
        timeArr = snapshot.val().time
      })
      return timeArr;
    },

    _activityname: async (item) => {
      firebase.database().ref('/activity_name').set({
        item
      });
    },

    }

export default Firebase
