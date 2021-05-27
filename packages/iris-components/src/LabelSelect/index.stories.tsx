/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from "react";

import { Story } from "@storybook/react/types-6-0";

import Select, { Props } from "./";

export default {
  title: "components/LabelSelect",
  component: Select,
};

const Template: Story<Props> = (args) => {
  const [active, setActive] = useState(args.labels[0].id);
  return (
    <Select
      {...args}
      activeLabel={active}
      onChange={(label) => {
        setActive(label);
      }}
    />
  );
};

export const Primary = Template.bind({});
Primary.args = {
  labels: [
    { name: "bloop", id: "0" },
    { name: "blop", id: "1" },
    { name: "bleep", id: "2" },
  ],
};
