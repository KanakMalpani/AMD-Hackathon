import React from "react";
import {Composition} from "remotion";
import {AutonomousStartupTutorial} from "./TutorialVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AutonomousStartupTutorial"
        component={AutonomousStartupTutorial}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
