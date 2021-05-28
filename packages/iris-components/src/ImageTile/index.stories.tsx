/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import { Story } from "@storybook/react/types-6-0";

import ImageTile from "./";

export default {
  title: "components/ImageTile",
  component: ImageTile,
  argTypes: {
    state: {
      control: {
        type: "inline-radio",
        options: ["active", "selected", "normal"],
      },
    },
  },
};

const Template: Story<any> = (args) => <ImageTile {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  state: "normal",
  url: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg",
};
