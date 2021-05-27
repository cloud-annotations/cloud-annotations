import React from "react";

import { Story } from "@storybook/react/types-6-0";

import CrossHair from "./";

export default {
  title: "components/CrossHair",
  component: CrossHair,
};

const Template: Story<any> = (args) => (
  <CrossHair active color="red" {...args}>
    <img
      style={{ width: 800 }}
      alt="dog"
      src="https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg"
    />
  </CrossHair>
);

export const Primary = Template.bind({});
