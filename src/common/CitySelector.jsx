import React, { useState, useMemo, useEffect, memo } from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import './CitySelector.css'

const CityItem = memo(function (porps) {
  const {
    name,
    onSelect
  } = porps

  return (
    <li
      className="city-li"
      onClick={() => onSelect(name)}>
        { name }
    </li>
  )
})

CityItem.propTypes = {
  name: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired
}


const CitySection = memo(function  (props) {
  const {
    title,
    cities = [],
    onSelect
  } = props

  return (
    <ul className="city-ul">
      <li className="city-li" key="title">
        {title}
      </li>
      {
        cities.map(city => {
          return <CityItem
                  key={city.name}
                  name={city.name}
                  onSelect={onSelect}
                />
        })
      }
    </ul>
  )
})

CitySection.propTypes = {
  title: PropTypes.string.isRequired,
  cities: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired
}

const CityList = memo(function  (props) {
  const {
    sections,
    onSelect
  } = props

  return (
    <div className="city-list">
      <div className="city-cate">
        {
          sections.map(section => {
            return <CitySection
                    key={section.title}
                    title={section.title}
                    cities={section.citys}
                    onSelect={onSelect}
                  />
          })
        }
      </div>
    </div>
  )
})

CityList.propTypes = {
  sections: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired
}

const CitySelector =  memo(function (props) {
  const {
    isLoading,
    cityData,
    show,
    onBack,
    fetchCityData,
    onSelect
  } = props

  const [searchKey, setSearchKey] = useState('')

  // 这里会每次渲染，但是如果 searchKey 没有变的话就不需要渲染
  // 只要 searchKey 不变的话，就不会渲染
  const key = useMemo(() => searchKey.trim(), [searchKey])

  useEffect(() => {
    if (!show || cityData || isLoading) {
      return
    }
    fetchCityData()
  }, [show, cityData, isLoading, fetchCityData])

  const outputCitySections = () => {
    if (isLoading) {
      return <div>Loading</div>
    }

    if (cityData) {
      return <CityList
              sections={cityData.cityList}
              onSelect={onSelect}
            />
    }

    return <div>Error</div>
  }

  return (
    <div className={classnames('city-selector', { hidden: !show })}>
      <div className="city-search">
        <div className="search-back" onClick={() => onBack()}>
          <svg width="42" height="42">
            <polyline
              points="25,13 16,21 25,29"
              stroke="#FFF"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchKey}
            className="search-input"
            placeholder="城市，车站的中文或拼音"
            onChange={e => setSearchKey(e.target.value)}
          />
        </div>
        <i
          className={classnames('search-clean', { hidden: key.length === 0 })}
          onClick={() => setSearchKey('')}
        >&#xf063;</i>
      </div>
      { outputCitySections() }
    </div>
  )
})

CitySelector.propTypes = {
  show: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  cityData: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  fetchCityData: PropTypes.func.isRequired
}

export default CitySelector
