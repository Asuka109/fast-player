import "./styles.css";
import { useThrottleFn, usePrevious } from "ahooks";
import { useState, useRef, useEffect } from "react";

const Video = () => {
  const videoRef = useRef(null);
  const onTick = () => {}; //console.log(videoRef.current?.currentTime);

  const [isPlaying, setPlaying] = useState(false);
  const freshPlayingState = () => setPlaying(!videoRef.current?.paused);
  const previousTime = useRef(-1);
  const isChanged = () =>
    previousTime.current !== videoRef.current?.currentTime;
  const _fireTickEvent = useThrottleFn(onTick, { wait: 32 });
  const fireTickEvent = () => {
    const changed = isChanged();
    if (changed) {
      console.log(
        (videoRef.current?.currentTime - previousTime.current) * 1000
      );
      _fireTickEvent.run();
    }
    previousTime.current = videoRef.current?.currentTime;
  };
  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(fireTickEvent, 8);
      return () => clearInterval(timer);
    }
  }, [isPlaying]);
  return (
    <video
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      ref={videoRef}
      autoPlay
      controls
      onPlaying={freshPlayingState}
      onPause={freshPlayingState}
      onSeeking={fireTickEvent}
    />
  );
};

const App = () => {
  return <Video />;
};

export default App;
