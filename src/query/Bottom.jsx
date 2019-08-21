import React, { memo, useMemo, useState, useCallback, useReducer } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import './Bottom.css'
import { ORDER_DEPART } from './constant'
import Slider from './Slider.jsx'

const Filter = memo(function (props) {
  const {
    name,
    checked,
    dispatch,
    value
  } = props
  return (
    <li className={classnames({ checked })} onClick={() => { dispatch({payload: value, type: 'toggle'}) }}>{name}</li>
  )
})

Filter.propTypes = {
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  toggle: PropTypes.func.isRequired,
}

const Option = memo(function Option (props) {
  const {
    title,
    options,
    checkedMap,
    dispatch
  } = props

  // const toggle = useCallback((value) => {
  //   const newCheckedMap = {...checkedMap}
  //   if (value in newCheckedMap) {
  //     delete newCheckedMap[value]
  //   } else {
  //     newCheckedMap[value] = true
  //   }

  //   dispatch(newCheckedMap)
  // }, [checkedMap, dispatch])

  return (
    <div className="option">
      <h3>{ title }</h3>
      <ul>
        {
          options.map(option => <Filter
                                  key={option.value}
                                  {...option} checked={option.value in checkedMap}
                                  dispatch={dispatch}
                                />)
        }
      </ul>
    </div>
  )
})

Option.propTypes = {
  title: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  checkedMap: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

const BottomModal = memo(function BottomModal (props) {
  const {
    checkedTicketTypes,
    checkedTrainTypes,
    checkedDepartStations,
    checkedArriveStations,
    departTimeStart,
    departTimeEnd,
    arriveTimeStart,
    arriveTimeEnd,
    ticketTypes,
    trainTypes,
    departStations,
    arriveStations,
    setCheckedTicketTypes,
    setCheckedTrainTypes,
    setCheckedArriveStations,
    setCheckedDepartStations,
    setDepartTimeStart,
    setDepartTimeEnd,
    setArriveTimeStart,
    setArriveTimeEnd,
    toggleIsFiltersVisible,
  } = props

  // 缓存层, 用过 callback 可以使 state 只在初始化的时候渲染
  // 因为这些数据基本上只加载一次即可，缓存层最终一并把数据提交
  // 这里开始的写法是 useState() 但是缺点是因为他们是 state，我们没法跟踪数据的变化
  // const [localCheckedTicketTypes, setLocalCheckedTicketTypes] = useState(() => {
  //   return {...checkedTicketTypes}
  // })

  // 局部 reducer, 不是很喜欢这样的设计
  const checkedReducer = (state, action) => {
    const { type, payload } = action
    switch (type) {
      case 'toggle':
        const newState = {...state}
        if (payload in newState) {
          delete newState[payload]
        } else {
          newState[payload] = false
        }
        return newState
      case 'reset':
        return {}
      default:
    }
    return state
  }

  const [localCheckedTicketTypes, localCheckedTicketTypesDispatch] = useReducer(
    checkedReducer, checkedTicketTypes, (checkedTicketTypes) => {
    return {...checkedTicketTypes}
  })
  const [localCheckedTrainTypes, localCheckedTrainTypesDispatch] = useReducer(
    checkedReducer, checkedTrainTypes, (checkedTrainTypes) => {
    return {...checkedTrainTypes}
  })
  const [localcheckedArriveStations, localCheckedArriveStationsDispatch] = useReducer(
    checkedReducer, checkedArriveStations ,(checkedArriveStations) => {
    return {...checkedArriveStations}
  })
  const [localCheckedDepartStations, localCheckedDepartStationsDispatch] = useReducer(
    checkedReducer, checkedDepartStations, (checkedDepartStations) => {
    return {...checkedDepartStations}
  })

  const [localDepartTimeStart, setLocalDepartTimeStart] = useState(
    departTimeStart
  )
  const [localDepartTimeEnd, setLocalDepartTimeEnd] = useState(departTimeEnd)
  const [localArriveTimeStart, setLocalArriveTimeStart] = useState(
      arriveTimeStart
  )
  const [localArriveTimeEnd, setLocalArriveTimeEnd] = useState(arriveTimeEnd)

  const optionGroup = [
    {
      title: '坐席类型',
      options: ticketTypes,
      checkedMap: localCheckedTicketTypes,
      dispatch: localCheckedTicketTypesDispatch,
    },
    {
      title: '车次类型',
      options: trainTypes,
      checkedMap: localCheckedTrainTypes,
      dispatch: localCheckedTrainTypesDispatch,
    },
    {
      title: '出发车站',
      options: departStations,
      checkedMap: localCheckedDepartStations,
      dispatch: localCheckedDepartStationsDispatch,
    },
    {
      title: '到达车站',
      options: arriveStations,
      checkedMap: localcheckedArriveStations,
      dispatch: localCheckedArriveStationsDispatch,
    }
  ]

  const sure = () => {
    setCheckedTicketTypes(localCheckedTicketTypes)
    setCheckedTrainTypes(localCheckedTrainTypes)
    setCheckedDepartStations(localCheckedDepartStations)
    setCheckedArriveStations(localcheckedArriveStations)
    setDepartTimeStart(localDepartTimeStart)
    setDepartTimeEnd(localDepartTimeEnd)
    setArriveTimeStart(localArriveTimeStart)
    setArriveTimeEnd(localArriveTimeEnd)
    toggleIsFiltersVisible()
  }

  const isResetDisabled = useMemo(() => {
    return Object.keys(localCheckedTicketTypes).length === 0 &&
      Object.keys(localCheckedTrainTypes).length === 0 &&
      Object.keys(localCheckedDepartStations).length === 0 &&
      Object.keys(localcheckedArriveStations).length === 0 &&
      localArriveTimeStart === 0 &&
      localArriveTimeEnd === 24 &&
      localDepartTimeStart === 0 &&
      localDepartTimeEnd === 24
  }, [
    localCheckedTicketTypes,
    localCheckedTrainTypes,
    localCheckedDepartStations,
    localcheckedArriveStations,
    localArriveTimeStart,
    localArriveTimeEnd,
    localDepartTimeStart,
    localDepartTimeEnd
  ])

  const reset = () => {
    if (isResetDisabled) return
    localCheckedTicketTypesDispatch({ type: 'reset'} )
    localCheckedTrainTypesDispatch({ type: 'reset'} )
    localCheckedDepartStationsDispatch({ type: 'reset'} )
    localCheckedArriveStationsDispatch({ type: 'reset'} )
    setLocalDepartTimeStart(0)
    setLocalDepartTimeEnd(24)
    setLocalArriveTimeStart(0)
    setLocalArriveTimeEnd(24)
  }

  return (
    <div className="bottom-modal">
      <div className="bottom-dialog">
        <div className="bottom-dialog-content">
          <div className="title">
            <span className={classnames('reset', {disabled: isResetDisabled})} onClick={() => reset()}>重置</span>
            <span className="ok" onClick={() => sure()}>确定</span>
          </div>
          <div className="options">
            {
              optionGroup.map(group => <Option {...group} key={group.title} />)
            }
            <Slider
              title="出发时间"
              currentStartHours={localDepartTimeStart}
              currentEndHours={localDepartTimeEnd}
              onStartChanged={setLocalDepartTimeStart}
              onEndChanged={setLocalDepartTimeEnd}
            />
            <Slider
              title="到达时间"
              currentStartHours={localArriveTimeStart}
              currentEndHours={localArriveTimeEnd}
              onStartChanged={setLocalArriveTimeStart}
              onEndChanged={setLocalArriveTimeEnd}
            />
          </div>
        </div>
      </div>
    </div>
  )
})

BottomModal.propTypes = {
  toggleIsFiltersVisible: PropTypes.func.isRequired,
  checkedTicketTypes: PropTypes.object.isRequired,
  checkedTrainTypes: PropTypes.object.isRequired,
  checkedDepartStations: PropTypes.object.isRequired,
  checkedArriveStations: PropTypes.object.isRequired,
  departTimeStart: PropTypes.number.isRequired,
  departTimeEnd: PropTypes.number.isRequired,
  arriveTimeStart: PropTypes.number.isRequired,
  arriveTimeEnd: PropTypes.number.isRequired,
  ticketTypes: PropTypes.array.isRequired,
  trainTypes: PropTypes.array.isRequired,
  departStations: PropTypes.array.isRequired,
  arriveStations: PropTypes.array.isRequired,
  setCheckedTicketTypes: PropTypes.func.isRequired,
  setCheckedTrainTypes: PropTypes.func.isRequired,
  setCheckedArriveStations: PropTypes.func.isRequired,
  setCheckedDepartStations: PropTypes.func.isRequired,
  setDepartTimeStart: PropTypes.func.isRequired,
  setDepartTimeEnd: PropTypes.func.isRequired,
  setArriveTimeStart: PropTypes.func.isRequired,
  setArriveTimeEnd: PropTypes.func.isRequired,
}

export default function Bottom (props) {
  const {
    highSpeed,
    orderType,
    onlyTickets,
    isFiltersVisible,
    toggleOrderType,
    toggleHighSpeed,
    toggleOnlyTickets,
    toggleIsFiltersVisible,
    checkedTicketTypes,
    checkedTrainTypes,
    checkedDepartStations,
    checkedArriveStations,
    departTimeStart,
    departTimeEnd,
    arriveTimeStart,
    arriveTimeEnd,
    ticketTypes,
    trainTypes,
    departStations,
    arriveStations,
    setCheckedTicketTypes,
    setCheckedTrainTypes,
    setCheckedArriveStations,
    setCheckedDepartStations,
    setDepartTimeStart,
    setDepartTimeEnd,
    setArriveTimeStart,
    setArriveTimeEnd
  } = props

  const noChecked = useMemo(() => {
    return (
        Object.keys(checkedTicketTypes).length === 0 &&
        Object.keys(checkedTrainTypes).length === 0 &&
        Object.keys(checkedDepartStations).length === 0 &&
        Object.keys(checkedArriveStations).length === 0 &&
        departTimeStart === 0 &&
        departTimeEnd === 24 &&
        arriveTimeStart === 0 &&
        arriveTimeEnd === 24
    );
}, [
    checkedTicketTypes,
    checkedTrainTypes,
    checkedDepartStations,
    checkedArriveStations,
    departTimeStart,
    departTimeEnd,
    arriveTimeStart,
    arriveTimeEnd,
]);

  return (
    <div className="bottom">
      <div className="bottom-filters">
        <span className="item" onClick={toggleOrderType}>
          <i className="icon">&#xf065;</i>
          { orderType === ORDER_DEPART ? '出发 早->晚' : '耗时 短->长' }
        </span>
        <span
          className={classnames('item', { 'item-on': highSpeed })}
          onClick={toggleHighSpeed}
        >
          <i className="icon">{highSpeed ? '\uf43f' : '\uf43e'}</i>
          只看高铁动车
        </span>
        <span
          className={classnames('item', { 'item-on': onlyTickets })}
          onClick={toggleOnlyTickets}
        >
          <i className="icon">{onlyTickets ? '\uf43d' : '\uf43c'}</i>
          只看有票
        </span>
        <span
          className={classnames('item', {
            'item-on': isFiltersVisible || !noChecked,
          })}
          onClick={toggleIsFiltersVisible}
        >
          <i className="icon">{noChecked ? '\uf0f7' : '\uf446'}</i>
          综合筛选
        </span>
      </div>
      {
        isFiltersVisible && (
          <BottomModal
            checkedTicketTypes={checkedTicketTypes}
            checkedTrainTypes={checkedTrainTypes}
            checkedDepartStations={checkedDepartStations}
            checkedArriveStations={checkedArriveStations}
            departTimeStart={departTimeStart}
            departTimeEnd={departTimeEnd}
            arriveTimeStart={arriveTimeStart}
            arriveTimeEnd={arriveTimeEnd}
            ticketTypes={ticketTypes}
            trainTypes={trainTypes}
            departStations={departStations}
            arriveStations={arriveStations}
            setCheckedTicketTypes={setCheckedTicketTypes}
            setCheckedTrainTypes={setCheckedTrainTypes}
            setCheckedArriveStations={setCheckedArriveStations}
            setCheckedDepartStations={setCheckedDepartStations}
            setDepartTimeStart={setDepartTimeStart}
            setDepartTimeEnd={setDepartTimeEnd}
            setArriveTimeStart={setArriveTimeStart}
            setArriveTimeEnd={setArriveTimeEnd}
            toggleIsFiltersVisible={toggleIsFiltersVisible}
          />
        )
      }
    </div>
  )
}

Bottom.propTypes = {
  highSpeed: PropTypes.bool.isRequired,
  orderType: PropTypes.number.isRequired,
  onlyTickets: PropTypes.bool.isRequired,
  isFiltersVisible: PropTypes.bool.isRequired,
  toggleOrderType: PropTypes.func.isRequired,
  toggleHighSpeed: PropTypes.func.isRequired,
  toggleOnlyTickets: PropTypes.func.isRequired,
  toggleIsFiltersVisible: PropTypes.func.isRequired,
  checkedTicketTypes: PropTypes.object.isRequired,
  checkedTrainTypes: PropTypes.object.isRequired,
  checkedDepartStations: PropTypes.object.isRequired,
  checkedArriveStations: PropTypes.object.isRequired,
  departTimeStart: PropTypes.number.isRequired,
  departTimeEnd: PropTypes.number.isRequired,
  arriveTimeStart: PropTypes.number.isRequired,
  arriveTimeEnd: PropTypes.number.isRequired,
  ticketTypes: PropTypes.array.isRequired,
  trainTypes: PropTypes.array.isRequired,
  departStations: PropTypes.array.isRequired,
  arriveStations: PropTypes.array.isRequired,
  setCheckedTicketTypes: PropTypes.func.isRequired,
  setCheckedTrainTypes: PropTypes.func.isRequired,
  setCheckedArriveStations: PropTypes.func.isRequired,
  setCheckedDepartStations: PropTypes.func.isRequired,
  setDepartTimeStart: PropTypes.func.isRequired,
  setDepartTimeEnd: PropTypes.func.isRequired,
  setArriveTimeStart: PropTypes.func.isRequired,
  setArriveTimeEnd: PropTypes.func.isRequired,
}
