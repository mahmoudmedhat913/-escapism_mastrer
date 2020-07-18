import React, { Component } from 'react';
import { StyleSheet, Text, View ,TouchableOpacity ,Alert, Button,ScrollView,Dimensions } from 'react-native';
import { withFirebaseHOC } from '../config/Firebase';
/*import {
    BarChart,
  } from 'react-native-chart-kit';*/
  class Activity extends Component {
  
    constructor(props){
      super(props);
   
      this.state = {
        initialArr: [],
        timeArr:'',
        status: false,
      }
   }
  
    _show = async () => {
      /*firebase.database().ref('Entry/').once('value', function (snapshot) {
        //console.log(snapshot.val().selectedItems)
        initialArr = snapshot.val().selectedItems;
        console.log(initialArr)
    });*/
    /*firebase.database().ref('Userdata/').on('value', (snapshot) =>{
      this.state.initialArr = snapshot.val().selectedItems,
      this.state.timeArr = snapshot.val().time
    })*/
    this.state.initialArr = await this.props.firebase._selecteditems(this.state.initialArr)
    this.state.timeArr = await this.props.firebase._time(this.state.timeArr)

    //console.log(this.state.initialArr)
    this.setState({
      status:!this.state.status
    });
    }
  
    SampleFunction= async (item)=>{
      /*firebase.database().ref('/activity_name').set({
        item
      }); */
      await this.props.firebase._activityname(item)
      this.props.navigation.navigate('Activityoption')
    }

    render(){
  
        var SampleNameArray = this.state.initialArr
          return (
            <View style={styles.Container}>
              <ScrollView>
            <View style={styles.MainContainer}>
                <TouchableOpacity onPress={this._show}>
                    <Text style={styles.textactivity}>Show Activities</Text>
                </TouchableOpacity>
                { this.state.status && SampleNameArray.map((item, key)=>(
                <Text key={key} style={styles.TextStyle} onPress={ this.SampleFunction.bind(this, item) }> { item } </Text>)
                )}
            </View>
            {/* <ScrollView>
             <View style={styles.chartapp}>
                <View>
                 <Text
                   style={{
                     textAlign: 'center',
                     fontSize: 18,
                     padding: 16,
                     marginTop: 16,
                   }}>
                   Activites (Bar Chart)
                 </Text>
                 <BarChart
                   data={{
                     labels: [
                       'January',
                       'February',
                       'March',
                       'April',
                       'May',
                       'June',
                     ],
                     datasets: [
                       {
                         data: [20, 30, 60, 66, 77, 89],
                       },
                     ],
                   }}
                   width={Dimensions.get('window').width - 16}
                   height={220}
                   yAxisLabel={'$'}
                   chartConfig={{
                     backgroundColor: '#1cc910',
                     backgroundGradientFrom: '#eff3ff',
                     backgroundGradientTo: '#efefef',
                     decimalPlaces: 2,
                     color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                     style: {
                       borderRadius: 16,
                     },
                   }}
                   style={{
                     marginVertical: 8,
                     borderRadius: 16,
                   }}
                 />
               </View>
            </View>
            </ScrollView> */}
            </ScrollView>
            </View>
            )
    }
    }
    const styles = StyleSheet.create({
   Container: {
        flex: 1,
        margin: 20,
      },
      MainContainer: {
        margin: 20,
        marginTop:20,
        paddingBottom:200,
        marginBottom:50,
        textAlign:'center',
      },
      
      TextStyle:{
        fontSize : 25,
         textAlign: 'center',
         fontWeight:'bold'
      },
      textactivity:{
        fontSize : 25,
        textAlign: 'center',
        fontWeight:'bold'
      },
      chartapp:{
            justifyContent: 'center',
            padding: 8,
            paddingTop: 20,
            backgroundColor: '#ecf0f1',
            marginBottom:200,
            
      }
    
     });
  
     export default withFirebaseHOC(Activity);