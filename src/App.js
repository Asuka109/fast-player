import "./styles.css";
import { useInterval, useThrottleFn } from "ahooks";
import { useState, useRef } from "react";

const useVideoTick = ({ ref, handler, rate }) => {
  const fireTickEvent = useThrottleFn(handler, { wait: rate });
  const reqAnimLock = useRef(0);
  const freshPlayingState = () => {
    cancelAnimationFrame(reqAnimLock.current);
    if (ref.current && !ref.current.paused) {
      const cb = () => {
        fireTickEvent.run();
        reqAnimLock.current = requestAnimationFrame(cb);
      };
      cb();
    }
  };
  return {
    onPlaying: freshPlayingState,
    onPause: freshPlayingState,
    onSeeking: fireTickEvent.run
  };
};

const composeEventProps = (...propsSet) => {
  const final = {};
  for (const props of propsSet) {
    for (const [event, handler] of Object.entries(props)) {
      final[event] = final[event] || [];
      final[event].push(handler);
    }
  }
  for (const event of Object.keys(final)) {
    const handlers = final[event];
    final[event] = (...args) => handlers.forEach((handler) => handler(...args));
  }
  return final;
};

const Video = (props) => {
  const videoRef = useRef(null);
  const videoTickProps = useVideoTick({
    ref: videoRef,
    handler: () => props.onTick?.(videoRef.current),
    rate: 1000 / 60
  });
  const finalProps = composeEventProps(videoTickProps, {
    onPlaying: () => console.log(123)
  });
  return (
    <video
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      ref={videoRef}
      autoPlay={false}
      controls
      {...finalProps}
    />
  );
};

const App = () => {
  const [count, setCount] = useState(0);
  const [rate, setRate] = useState(0);
  const ticksEachSec = useRef(0);
  useInterval(() => {
    setRate(ticksEachSec.current);
    ticksEachSec.current = 0;
  }, 1000);
  return (
    <div>
      <Video
        onTick={(video) => {
          setCount(count + 1);
          ticksEachSec.current++;
          video.currentTime > 3 && (video.currentTime = 0);
        }}
      />
      <span>{count}</span>
      <p>{rate}</p>
    </div>
  );
};

export default App;
