import React, { useCallback, useEffect, useMemo } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import URI from 'urijs'
import useNav from '../common/useNav'
import './App.css'

import Header from '../common/Header'
import Nav from '../common/Nav'
import List from './List'
import Bottom from './Bottom'
import { h0 } from '../common/fp'

import {
  setFrom,
  setTo,
  setHighSpeed,
  setDepartDate,
  setSearchParsed,
  setTrainList,
  setTicketTypes,
  setTrainTypes,
  setDepartStations,
  setArriveStations,
  prevDate,
  nextDate,
  toggleOrderType,
  toggleHighSpeed,
  toggleOnlyTickets,
  toggleIsFiltersVisible,
  setCheckedTicketTypes,
  setCheckedTrainTypes,
  setCheckedArriveStations,
  setCheckedDepartStations,
  setDepartTimeStart,
  setDepartTimeEnd,
  setArriveTimeStart,
  setArriveTimeEnd
} from './store/actions'

import dayjs from 'dayjs'

function App (props) {
  const {
    trainList,
    from,
    to,
    highSpeed,
    departDate,
    dispatch,
    searchParsed,
    orderType,
    onlyTickets,
    checkedTicketTypes,
    checkedTrainTypes,
    checkedDepartStations,
    checkedArriveStatuons,
    departTimeStart,
    departTimeEnd,
    arriveTimeStart,
    arriveTimeEnd,
    isFiltersVisible,
    ticketTypes,
    trainTypes,
    departStations,
    arriveStations
  } = props

  // 解析字符串，这个副作用仅仅运行一次就可以
  // 获取解析之后的字符串后进行资源的异步加载
  useEffect(() => {
    const queries = URI.parseQuery(window.location.search)
    const { from, to, highSpeed, date } = queries

    dispatch(setFrom(from))
    dispatch(setTo(to))
    dispatch(setHighSpeed(highSpeed === 'true'))
    dispatch(setDepartDate(dayjs(h0(date)).valueOf()))
    dispatch(setSearchParsed(true))
  }, [dispatch])

  useEffect(() => {
    if (!searchParsed) return

    const url = new URI('/rest/query')
          .setSearch('from', from)
          .setSearch('to', to)
          .setSearch('date', dayjs(departDate).format('YYYY-MM-DD'))
          .setSearch('highSpeed', highSpeed)
          .setSearch('checkedTicketTypes', Object.keys(checkedTicketTypes).join())
          .setSearch('checkedTrainTypes', Object.keys(checkedTrainTypes).join())
          .setSearch('checkedDepartStations', Object.keys(checkedDepartStations).join())
          .setSearch('checkedArriveStatuons', Object.keys(checkedArriveStatuons).join())
          .setSearch('departTimeStart', departTimeStart)
          .setSearch('departTimeEnd', departTimeEnd)
          .setSearch('arriveTimeStart', arriveTimeStart)
          .setSearch('arriveTimeEnd', arriveTimeEnd)
          .toString()

    fetch(url)
      .then(res => res.json())
      .then(result => {
        const {
          dataMap: {
            directTrainInfo: {
              trains,
              filter: {
                ticketType,
                trainType,
                depStation,
                arrStation
              }
            }
          }
        } = result

        dispatch(setTrainList(trains))
        dispatch(setTicketTypes(ticketType))
        dispatch(setTrainTypes(trainType))
        dispatch(setDepartStations(depStation))
        dispatch(setArriveStations(arrStation))
      })
  }, [
    dispatch,
    from,
    to,
    highSpeed,
    departDate,
    searchParsed,
    orderType,
    onlyTickets,
    checkedTicketTypes,
    checkedTrainTypes,
    checkedDepartStations,
    checkedArriveStatuons,
    departTimeStart,
    departTimeEnd,
    arriveTimeStart,
    arriveTimeEnd,
  ])

  const onBack = useCallback(() => {
    window.history.back()
  }, [])

  const {
    isPrevDisabled,
    isNextDisabled,
    prev,
    next
  } = useNav(departDate, dispatch, prevDate, nextDate)

  const bottomCbs = useMemo(() => {
    return bindActionCreators({
      toggleOrderType,
      toggleHighSpeed,
      toggleOnlyTickets,
      toggleIsFiltersVisible,
      setCheckedTicketTypes,
      setCheckedTrainTypes,
      setCheckedArriveStations,
      setCheckedDepartStations,
      setDepartTimeStart,
      setDepartTimeEnd,
      setArriveTimeStart,
      setArriveTimeEnd
    }, dispatch)
  }, [dispatch])

  // 如果请求返回错误，就返回 null，这里省略了处理错误请求的细节
  if (!searchParsed) {
    return null
  }

  return (
    <div>
      <div className="header-wrapper">
        <Header title={`${from} - ${to}`} onBack={onBack} />
      </div>
      <Nav
        date={departDate}
        isPrevDisabled={isPrevDisabled}
        isNextDisabled={isNextDisabled}
        prev={prev}
        next={next}
      />
      <List list={trainList} />
      <Bottom
        {...bottomCbs}
        highSpeed={highSpeed}
        orderType={orderType}
        onlyTickets={onlyTickets}
        isFiltersVisible={isFiltersVisible}
        checkedTicketTypes={checkedTicketTypes}
        checkedTrainTypes={checkedTrainTypes}
        checkedDepartStations={checkedDepartStations}
        checkedArriveStatuons={checkedArriveStatuons}
        departTimeStart={departTimeStart}
        departTimeEnd={departTimeEnd}
        arriveTimeStart={arriveTimeStart}
        arriveTimeEnd={arriveTimeEnd}
        ticketTypes={ticketTypes}
        trainTypes={trainTypes}
        departStations={departStations}
        arriveStations={arriveStations}
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
