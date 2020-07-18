import React, {Component} from 'react';
import { Text, View } from 'react-native';

console.disableYellowBox=true;

  class Recommend extends Component{
    render(){

        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBF0D2' }}>
              <Text>Recommendations!</Text>
            </View>
          );
}
}
Recommend.navigationOptions = {
  headerTitle: 'Status'
};
export default Recommend;
