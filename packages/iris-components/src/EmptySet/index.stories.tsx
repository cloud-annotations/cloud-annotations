/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import { Story } from "@storybook/react/types-6-0";

import EmptySet from "./";

export default {
  title: "components/EmptySet",
  component: EmptySet,
};

const Template: Story<any> = (args) => <EmptySet show {...args} />;

export const Primary = Template.bind({});
