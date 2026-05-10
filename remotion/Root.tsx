import React from "react";
import {Composition} from "remotion";
import {
  LaunchMyIdeaAITutorial,
  launchMyIdeaDurationInFrames,
} from "./TutorialVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LaunchMyIdeaAITutorial"
        component={LaunchMyIdeaAITutorial}
        durationInFrames={launchMyIdeaDurationInFrames}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
