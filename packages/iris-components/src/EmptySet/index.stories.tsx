import React from "react";

import { Story } from "@storybook/react/types-6-0";

import EmptySet from "./";

export default {
  title: "components/EmptySet",
  component: EmptySet,
};

const Template: Story<any> = (args) => <EmptySet show {...args} />;

export const Primary = Template.bind({});
