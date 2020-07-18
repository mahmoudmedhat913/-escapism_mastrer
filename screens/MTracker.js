import React, { Component } from 'react';
import { StyleSheet, View ,TextInput ,Button,Text} from 'react-native';
import MultiSelect from 'react-native-multiple-select';
import { ListItem } from 'react-native-elements';
import { withFirebaseHOC } from '../config/Firebase';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
console.disableYellowBox=true;
const items = [{
  id: '1',
  name: 'Work',

}, {
  id: '2',
  name: 'relax'
}, {
  id: '3',
  name: 'family'
}, {
  id: '4',
  name: 'friends'
}, {
  id: '5',
  name: 'date'
}, {
  id: '6',
  name: 'sport'
}, {
  id: '7',
  name: 'party'
}, {
  id: '8',
  name: 'movies'
}, {
  id: '9',
  name: 'reading'
}, {
  id: '10',
  name: 'gaming'
}, {
  id: '11',
  name: 'shopping'
  
}, {
  id: '12',
  name: 'good meal'
  
}
, {
  id: '13',
  name: 'cleaning'
  
}
]
class MTracker extends Component{
  handlecActivityNavigation = () => {
    this.props.navigation.navigate('Activity' ,{Status: this})
  }
  /*writeuserdata(selectedItems){//=>Write in fire base and retrive data
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
    }*/
state = {
 // value:'',
 //id=this.setState({id}),
 //name=this.setState({name}),
  selectedItems: [],
  Holder: '',
  //time:''
}
constructor(props) {
  super(props);
  this.state = {
    //defauilt value of the time
    time: '',
  };
}
componentDidMount() {
  var that = this;

  //Getting the current date-time with required formate and UTC   
  var date = moment()
    .utcOffset('+02:00')
    .format('YYYY-MM-DD hh:mm:ss a');

  that.setState({ time: date });
  //Settign up time to show
}


onSelectedItemsChange = (selectedItems) => {
  this.setState({ selectedItems}, () => console.warn('Selected Activities: ', selectedItems))
  
}
  render () {
    const { selectedItems } = this.state
    return (
      <View style={styles.container}>
        <View style={styles.multiSelectContainer}>
          <MultiSelect
            items={items}
            uniqueKey='id'
            uniqueKey='name'
            onSelectedItemsChange={this.onSelectedItemsChange}
            selectedItems={selectedItems}
            selectText='WHAT HAVE YOU BEEN UP TO?'
            searchInputPlaceholderText='Activities List...'
            onChangeInput={(text) => console.warn(text)}
            tagRemoveIconColor='#D60'
            tagBorderColor='#000'
            tagTextColor='#3AD'
            selectedItemTextColor='#1B1'
            selectedItemIconColor='#CCC'
            itemTextColor='#000'
            displayKey='name'
            searchInputStyle={{ color: '#CCC' }}
            submitButtonColor='#CCC'
            submitButtonText='Submit'
           // submitButtonText={()=>this.writeuserdata(this.writeuserdata(this.state.selectedItems))}
            removeSelected
          />
         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20 }}>{this.state.time}</Text>
      </View>
        </View>
      <Button title = "save"
      onPress = {async() => await this.props.firebase.writeuserdata(this.state.selectedItems)}
     
      ></Button>
      <View style={styles.multiButtonContainer}>  
                    <Button  
                        onPress={this.handlecActivityNavigation}
                        title="OK!"  
                        color="#009933"  
                    />  
                    </View>
      {/* <Button style={styles.butto}
      color="#000"
      title = "Next"

      onPress={this.handlecActivityNavigation} 

      ></Button> */}
      </View>
    )
  }
}
MTracker.navigationOptions = {
  headerTitle: 'Recommend'
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF0D2'
  },
  multiSelectContainer: {
    height: 400,
    width: '80%'
  },  
  multiButtonContainer: {  
      margin: 20,  
      flexDirection: 'row',  
      justifyContent: 'space-between'  
  }  
 
})
export default withFirebaseHOC(MTracker);
