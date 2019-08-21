import React, { memo, useState, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import leftPad from 'left-pad';
import useWinSize from '../common/useWinSize';
import './Slider.css';

const Slider = memo(function Slider(props) {
  const {
    title,
    currentStartHours,
    currentEndHours,
    onStartChanged,
    onEndChanged,
  } = props;

  const winSize = useWinSize();

  // 记录 dom 节点，跨越渲染周期
  const startHandle = useRef();
  const endHandle = useRef();

  // 记录上一次节点的位置，useRef 可以跨越组件，不仅可以记录节点，还可以记录数据
  const lastStartX = useRef();
  const lastEndX = useRef();

  // 不使用 state, state 变化会触发组建的额重新渲染
  const range = useRef();
  const rangeWidth = useRef();

  // 记录上一次传入的值
  const prevCurrentStartHours = useRef(currentStartHours);
  const prevCurrentEndHours = useRef(currentEndHours);

  // 二级缓存，转换成百分比
  // 因为这里面需要做计算，使用 callbback 使 state 只在第一次渲染
  const [start, setStart] = useState(() => (currentStartHours / 24) * 100);
  const [end, setEnd] = useState(() => (currentEndHours / 24) * 100);

  // 这里的写法，对应到类组件，就相当于 getDerivedStateFromProps() 方法
  if (prevCurrentStartHours.current !== currentStartHours) {
    // 只在有状态改变的时候采取更新
    setStart((currentStartHours / 24) * 100);
    prevCurrentStartHours.current = currentStartHours;
  }

  if (prevCurrentEndHours.current !== currentEndHours) {
    setEnd((currentEndHours / 24) * 100);
    prevCurrentEndHours.current = currentEndHours;
  }

  // 使用 useMemo 来优化计算属性
  const startPercent = useMemo(() => {
    if (start > 100) {
      return 100;
    }

    if (start < 0) {
      return 0;
    }

    return start;
  }, [start]);

  const endPercent = useMemo(() => {
    if (end > 100) {
      return 100;
    }

    if (end < 0) {
      return 0;
    }

    return end;
  }, [end]);

  const startHours = useMemo(() => {
    return Math.round((startPercent * 24) / 100);
  }, [startPercent]);

  const endHours = useMemo(() => {
    return Math.round((endPercent * 24) / 100);
  }, [endPercent]);

  const startText = useMemo(() => {
    return leftPad(startHours, 2, '0') + ':00';
  }, [startHours]);

  const endText = useMemo(() => {
    return leftPad(endHours, 2, '0') + ':00';
  }, [endHours]);

  function onStartTouchBegin(e) {
    const touch = e.targetTouches[0];
    lastStartX.current = touch.pageX;
  }

  function onEndTouchBegin(e) {
    const touch = e.targetTouches[0];
    lastEndX.current = touch.pageX;
  }

  function onStartTouchMove(e) {
    const touch = e.targetTouches[0];
    const distance = touch.pageX - lastStartX.current;
    lastStartX.current = touch.pageX;

    setStart(start => start + (distance / rangeWidth.current) * 100);
  }

  function onEndTouchMove(e) {
    const touch = e.targetTouches[0];
    const distance = touch.pageX - lastEndX.current;
    lastEndX.current = touch.pageX;

    setEnd(end => end + (distance / rangeWidth.current) * 100);
  }

  useEffect(() => {
    rangeWidth.current = parseFloat(
      window.getComputedStyle(range.current).width
    );
  }, [winSize.width]);

  // dom 每次重新渲染可能导致事件解绑，所以这里没有传入依赖，让它每次都绑定
  // 因为使用了解绑函数，不必担心内存泄露
  useEffect(() => {
    startHandle.current.addEventListener(
      'touchstart',
      onStartTouchBegin,
      false
    );
    startHandle.current.addEventListener(
      'touchmove',
      onStartTouchMove,
      false
    );
    endHandle.current.addEventListener(
      'touchstart',
      onEndTouchBegin,
      false
    );
    endHandle.current.addEventListener('touchmove', onEndTouchMove, false);

    // 在 return 函数中进行解绑
    return () => {
      startHandle.current.removeEventListener(
        'touchstart',
        onStartTouchBegin,
        false
      );
      startHandle.current.removeEventListener(
        'touchmove',
        onStartTouchMove,
        false
      );
      endHandle.current.removeEventListener(
        'touchstart',
        onEndTouchBegin,
        false
      );
      endHandle.current.removeEventListener(
        'touchmove',
        onEndTouchMove,
        false
      );
    };
  });

  useEffect(() => {
    onStartChanged(startHours);
  }, [startHours]);

  useEffect(() => {
    onEndChanged(endHours);
  }, [endHours]);

  return (
    <div className="option">
      <h3>{title}</h3>
      <div className="range-slider">
        <div className="slider" ref={range}>
          <div
            className="slider-range"
            style={{
              left: startPercent + '%',
              width: endPercent - startPercent + '%',
            }}
          ></div>
          <i
            ref={startHandle}
            className="slider-handle"
            style={{
              left: startPercent + '%',
            }}
          >
            <span>{startText}</span>
          </i>
          <i
            ref={endHandle}
            className="slider-handle"
            style={{
              left: endPercent + '%',
            }}
          >
            <span>{endText}</span>
          </i>
        </div>
      </div>
    </div>
  );
});

Slider.propTypes = {
  title: PropTypes.string.isRequired,
  currentStartHours: PropTypes.number.isRequired,
  currentEndHours: PropTypes.number.isRequired,
  onStartChanged: PropTypes.func.isRequired,
  onEndChanged: PropTypes.func.isRequired,
};

export default Slider;
