/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface Menu {
  name: string;
  items: Item[];
}

export type Item = Divider | MenuItem;

export interface Divider {
  divider: boolean;
}

export interface MenuItem {
  name: string;
  disabled?: boolean;
  action?: () => void;
  link?: string;

  items?: Item[];
  tooltip?: Tooltip;
}

export interface TooltipMenuItem extends MenuItem {
  tooltip: Tooltip;
  items: never;
}

export interface SubMenuItem extends MenuItem {
  items: Item[];
  tooltip: never;
}

export interface Tooltip {
  title: string;
  description: string;
  link: string;
}

export function isDivider(item: Divider | MenuItem): item is Divider {
  return (item as Divider).divider === true;
}

export function isMenuItem(item: Divider | MenuItem): item is MenuItem {
  return (item as MenuItem).name !== undefined;
}

export function isTooltipMenuItem(
  item: Divider | MenuItem
): item is TooltipMenuItem {
  return isMenuItem(item) && (item as TooltipMenuItem).tooltip !== undefined;
}

export function isSubMenuItem(item: Divider | MenuItem): item is SubMenuItem {
  return isMenuItem(item) && (item as SubMenuItem).items !== undefined;
}
