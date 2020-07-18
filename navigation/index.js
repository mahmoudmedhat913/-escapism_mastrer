import { createSwitchNavigator, createAppContainer } from 'react-navigation'
import Initial from '../screens/Initial'
import AuthNavigation from './AuthNavigation'
import TabNavigator from './TabNavigator'

const SwitchNavigator = createSwitchNavigator(
  {
    Initial: Initial,
    Auth: AuthNavigation,
    App: TabNavigator
  },
  {
    initialRouteName: 'Initial'
  }
)

const AppContainer = createAppContainer(SwitchNavigator)

export default AppContainer
