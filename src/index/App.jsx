import React, {
  useCallback,
  useMemo
} from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import './App.css'

import Header from '../common/Header'
import CitySelector from '../common/CitySelector'
import DateSelector from '../common/DateSelector'
import DepartDate from './DepartDate.jsx'
import HighSpeed from './HighSpeed'
import Journey from './Journey'
import Submit from './Submit'

import { h0 } from '../common/fp'

import {
  exchangeFromTo,
  showCitySelector,
  hideCitySelector,
  setSelectedCity,
  fetchCityData,
  showDateSelector,
  hideDateSelector,
  setDepartDate,
  toggleHighSpeed
} from './store/actions'

function App (props) {
  const {
    from,
    to,
    isCitySelectorVisible,
    isDateSelectorVisible,
    isLoadingCityData,
    cityData,
    departDate,
    highSpeed,
    dispatch
  } = props
  const onBack = useCallback(() => {
    // 当我们向子组件传入 callback 时，需要注意重新渲染的问题
    // 每次 onBack handler 变化都会导致重新的渲染
    // onBack 没有依赖任何变量，空数组即可
    window.history.back()
  }, [])

  // const doExchangeFromTo = useCallback(() => {
  //   dispatch(exchangeFromTo())
  // }, [dispatch])

  // const doShowCitySelector = useCallback(m => {
  //   dispatch(showCitySelector(m))
  // }, [dispatch])

  const journeyCbs = useMemo(() => {
    return bindActionCreators({
      exchangeFromTo,
      showCitySelector,
    }, dispatch)
  }, [dispatch])

  const citySelectorCbs = useMemo(() => {
    return bindActionCreators({
      onBack: hideCitySelector,
      onSelect: setSelectedCity,
      fetchCityData
    }, dispatch)
  }, [dispatch])

  const departDateCbs = useMemo(() => {
    return bindActionCreators({
      onClick: showDateSelector
    }, dispatch)
  }, [dispatch])

  const dateSelectorCbs = useMemo(() => {
    return bindActionCreators({
      onBack: hideDateSelector
    }, dispatch)
  }, [dispatch])

  const onSelectDate = useCallback(day => {
    if (!day || day < h0()) return
    dispatch(setDepartDate(day))
    dispatch(hideDateSelector())
  }, [dispatch])

  const highSpeedCbs = useMemo(() => {
    return bindActionCreators({
      toggle: toggleHighSpeed
    }, dispatch)
  }, [dispatch])

  return (
    <div>
      <div className="header-wrapper">
        <Header title="火车票" onBack={onBack} />
      </div>
      <form className="form" action="./query.html">
        <Journey
          from = {from}
          to = {to}
          {...journeyCbs}
          // exchangeFromTo = {doExchangeFromTo}
          // showCitySelector = {doShowCitySelector}
        />
        <DepartDate
          time={departDate}
          {...departDateCbs}
        />
        <HighSpeed
          highSpeed={highSpeed}
          {...highSpeedCbs}
        />
        <Submit />
      </form>
      <CitySelector
        isLoading={isLoadingCityData}
        cityData={cityData}
        show={isCitySelectorVisible}
        {...citySelectorCbs}
      />
      <DateSelector
        show={isDateSelectorVisible}
        onSelect={onSelectDate}
        {...dateSelectorCbs}
      />
    </div>
  )
}

export default connect(
  function mapStateToProps (state) {
    return state
  },
  function mapDispatchToProps (dispatch) {
    return { dispatch }
  }
)(App)
